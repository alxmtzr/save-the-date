import { spawn, type ChildProcess } from 'node:child_process'
import { rmSync } from 'node:fs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createServer, type ViteDevServer } from 'vite'
import { HEART_STROKES } from '../components/heartPaths.ts'
import { wedding } from '../config.ts'

interface Viewport {
  name: string
  width: number
  height: number
  dpr: number
  mobile: boolean
}

const VIEWPORTS: readonly Viewport[] = [
  // --- Android Smartphones (Samsung Galaxy, Google Pixel, Xiaomi/Redmi, OnePlus, Motorola) ---
  { name: 'Android 16:9 Classic / Moto G (360x640)', width: 360, height: 640, dpr: 2, mobile: true },
  { name: 'Samsung Galaxy S22 / S23 / S24 (360x780)', width: 360, height: 780, dpr: 3, mobile: true },
  { name: 'Samsung Galaxy A54 / A55 / Redmi Note 13 (360x800)', width: 360, height: 800, dpr: 3, mobile: true },
  { name: 'Samsung Galaxy S24 Ultra WQHD+ (384x824)', width: 384, height: 824, dpr: 3.75, mobile: true },
  { name: 'Samsung Galaxy S21 Ultra / S22+ / S23+ (384x854)', width: 384, height: 854, dpr: 3, mobile: true },
  { name: 'Xiaomi 13 / 14 / OnePlus 11 / 12 (393x873)', width: 393, height: 873, dpr: 3, mobile: true },
  { name: 'Google Pixel 7 / Pixel 8 / Galaxy S24+ (412x915)', width: 412, height: 915, dpr: 2.625, mobile: true },
  { name: 'Google Pixel 8 Pro / Pixel 9 Pro XL (448x998)', width: 448, height: 998, dpr: 3, mobile: true },

  // --- Foldables (Cover & Unfolded Displays) ---
  { name: 'Samsung Galaxy Z Fold 5 / 6 Cover (344x882)', width: 344, height: 882, dpr: 3, mobile: true },
  { name: 'Samsung Galaxy Z Flip 5 / 6 (412x919)', width: 412, height: 919, dpr: 2.625, mobile: true },
  { name: 'Samsung Galaxy Z Fold 5 / 6 Unfolded (690x828)', width: 690, height: 828, dpr: 2.6, mobile: true },
  { name: 'Google Pixel Fold / OnePlus Open Unfolded (786x654)', width: 786, height: 654, dpr: 2.5, mobile: true },

  // --- Apple iPhones ---
  { name: 'iPhone SE 1st Gen (320x568)', width: 320, height: 568, dpr: 2, mobile: true },
  { name: 'iPhone SE 3 / iPhone 8 (375x667)', width: 375, height: 667, dpr: 2, mobile: true },
  { name: 'iPhone 12 / 13 Mini (375x812)', width: 375, height: 812, dpr: 3, mobile: true },
  { name: 'iPhone 13 / 14 (390x844)', width: 390, height: 844, dpr: 3, mobile: true },
  { name: 'iPhone 15 / 16 (393x852)', width: 393, height: 852, dpr: 3, mobile: true },
  { name: 'iPhone 16 Pro (402x874)', width: 402, height: 874, dpr: 3, mobile: true },
  { name: 'iPhone 15 Plus / 15 Pro Max / 16 Plus (430x932)', width: 430, height: 932, dpr: 3, mobile: true },
  { name: 'iPhone 16 Pro Max (440x956)', width: 440, height: 956, dpr: 3, mobile: true },

  // --- Mobile Landscape (Android & iOS) ---
  { name: 'Android Landscape (800x360)', width: 800, height: 360, dpr: 3, mobile: true },
  { name: 'iPhone Landscape (844x390)', width: 844, height: 390, dpr: 3, mobile: true },
  { name: 'Pixel 8 / Galaxy S24 Ultra Landscape (915x412)', width: 915, height: 412, dpr: 2.625, mobile: true },

  // --- Tablets (Android Galaxy Tab & Apple iPad) ---
  { name: 'Samsung Galaxy Tab S9 Portrait (753x1205)', width: 753, height: 1205, dpr: 2, mobile: true },
  { name: 'iPad Mini / iPad Air Portrait (768x1024)', width: 768, height: 1024, dpr: 2, mobile: true },
  { name: 'iPad Pro 11" Portrait (834x1194)', width: 834, height: 1194, dpr: 2, mobile: true },
  { name: 'iPad Landscape (1024x768)', width: 1024, height: 768, dpr: 2, mobile: true },
  { name: 'iPad Pro 12.9" / 13" Portrait (1024x1366)', width: 1024, height: 1366, dpr: 2, mobile: true },
  { name: 'Samsung Galaxy Tab S9 Landscape (1205x753)', width: 1205, height: 753, dpr: 2, mobile: true },

  // --- Laptops & Desktops ---
  { name: '13" Compact Laptop (1280x720)', width: 1280, height: 720, dpr: 2, mobile: false },
  { name: '13" WXGA Laptop (1280x800)', width: 1280, height: 800, dpr: 2, mobile: false },
  { name: '14" Standard Windows Laptop (1366x768)', width: 1366, height: 768, dpr: 1, mobile: false },
  { name: 'MacBook Air 13" (1440x900)', width: 1440, height: 900, dpr: 2, mobile: false },
  { name: 'MacBook Pro 14" (1512x982)', width: 1512, height: 982, dpr: 2, mobile: false },
  { name: '15.6" Windows Laptop 125% Scale (1536x864)', width: 1536, height: 864, dpr: 1.25, mobile: false },
  { name: 'Full HD Laptop / Desktop (1920x1080)', width: 1920, height: 1080, dpr: 1, mobile: false },
  { name: '27" QHD Monitor (2560x1440)', width: 2560, height: 1440, dpr: 1, mobile: false },
]

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const isHeaded = process.env.HEADED === '1'
const stepDelay = (headlessMs: number, headedMs: number) => sleep(isHeaded ? headedMs : headlessMs)

class CdpSession {
  private ws!: WebSocket
  private id = 0
  private pending = new Map<number, (res: unknown) => void>()

  async connect(wsUrl: string): Promise<void> {
    this.ws = new WebSocket(wsUrl)
    await new Promise((r) => this.ws.addEventListener('open', r))
    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(String(event.data)) as { id?: number; result?: unknown }
      if (msg.id && this.pending.has(msg.id)) {
        this.pending.get(msg.id)!(msg.result)
        this.pending.delete(msg.id)
      }
    })
  }

  send<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    return new Promise((resolve) => {
      const id = ++this.id
      this.pending.set(id, resolve as (res: unknown) => void)
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  async eval<T>(expression: string): Promise<T> {
    const res = await this.send<{ result: { value: T } }>('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    return res.result.value
  }

  close(): void {
    this.ws?.close()
  }
}

function findChromeBinary(): string {
  return process.env.CHROME_PATH || 'google-chrome'
}

describe('End-to-End Functional & Multi-Device UI Suite', () => {
  let server: ViteDevServer
  let baseUrl: string
  let chrome: ChildProcess
  let cdp: CdpSession
  let userDataDir: string

  beforeAll(async () => {
    server = await createServer({ server: { port: 0, host: '127.0.0.1' }, logLevel: 'silent' })
    await server.listen()
    const addr = server.httpServer?.address()
    const port = typeof addr === 'object' && addr ? addr.port : 5173
    baseUrl = `http://127.0.0.1:${port}/`

    const debugPort = 9600 + Math.floor(Math.random() * 300)
    userDataDir = `/tmp/std-vitest-cdp-${debugPort}`
    let stderrLog = ''
    chrome = spawn(
      findChromeBinary(),
      [
        ...(isHeaded
          ? ['--new-window', '--window-size=1280,960']
          : ['--headless=new', '--disable-gpu', '--disable-software-rasterizer']),
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-breakpad',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-fre',
        '--disable-search-engine-choice-screen',
        '--disable-sync',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--disable-component-update',
        '--disable-background-networking',
        '--disable-features=Translate,OptimizationHints,MediaRouter,DialMediaRouteProvider,PrivacySandboxSettings4,ChromeWhatsNewUI',
        '--password-store=basic',
        '--use-mock-keychain',
        '--hide-scrollbars',
        '--remote-debugging-address=127.0.0.1',
        `--remote-debugging-port=${debugPort}`,
        `--user-data-dir=${userDataDir}`,
        'about:blank',
      ],
      {
        stdio: ['ignore', 'ignore', 'pipe'],
        env: {
          ...process.env,
          DBUS_SESSION_BUS_ADDRESS: '/dev/null',
        },
      },
    )
    chrome.stderr?.on('data', (chunk) => {
      stderrLog += String(chunk)
    })

    let page: { type: string; webSocketDebuggerUrl: string } | undefined
    for (let i = 0; i < 150; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${debugPort}/json`)
        if (res.ok) {
          const targets = (await res.json()) as Array<{ type: string; webSocketDebuggerUrl?: string }>
          const found = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
          if (found?.webSocketDebuggerUrl) {
            page = { type: found.type, webSocketDebuggerUrl: found.webSocketDebuggerUrl }
            break
          }
        }
      } catch {
        // Chrome debugging server not listening yet
      }
      await sleep(100)
    }

    if (!page) {
      throw new Error(`Chrome DevTools target did not become ready on port ${debugPort}. stderr:\n${stderrLog}`)
    }

    cdp = new CdpSession()
    await cdp.connect(page.webSocketDebuggerUrl)
    await cdp.send('Page.enable')

    // Warm up Vite dependency pre-bundling and vite-imagetools AVIF/WebP/JPG generation
    // so subsequent navigations in tests are instantaneous even on cold CI runners.
    await cdp.send('Page.navigate', { url: baseUrl })
    for (let i = 0; i < 250; i++) {
      const ready = await cdp.eval<boolean>(
        `Boolean(document.querySelector('main img')?.complete && document.querySelector('h1'))`,
      )
      if (ready) break
      await sleep(100)
    }
  }, 45_000)

  afterAll(async () => {
    cdp?.close()
    if (chrome && chrome.exitCode === null) {
      chrome.kill('SIGKILL')
      await new Promise((r) => chrome.once('exit', r))
    }
    await server?.close()
    if (userDataDir) {
      rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
    }
  })

  it('plays the full calligraphic HeartIntro animation from stroke drawing to automatic reveal', async () => {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    })
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
    })
    await cdp.send('Page.navigate', { url: baseUrl })

    // Wait for the HeartIntro SVG to mount
    for (let i = 0; i < 30; i++) {
      const mounted = await cdp.eval<boolean>(`Boolean(document.querySelector('svg[viewBox="0 0 380 340"]'))`)
      if (mounted) break
      await sleep(50)
    }

    // 1. Inspect initial intro structure while strokes are drawing
    await sleep(350)
    const drawingState = await cdp.eval<{
      overlayPresent: boolean
      maskCount: number
      ribbonCount: boolean
      coupleLabelPresent: boolean
      shortDatePresent: boolean
      skipTextPresent: boolean
      heartFitsViewport: boolean
      skipFitsViewport: boolean
      noOverlapWithSkip: boolean
    }>(`(() => {
      const overlay = document.querySelector('div[role="presentation"]');
      const svg = document.querySelector('svg[viewBox="0 0 380 340"]');
      const masks = svg ? svg.querySelectorAll('defs mask') : [];
      const ribbons = svg ? svg.querySelectorAll('path[mask]') : [];
      const skip = Array.from(document.querySelectorAll('span')).find(s => s.textContent?.includes(${JSON.stringify(wedding.t.skipIntro)}));
      if (!overlay || !svg || !skip) {
        return {
          overlayPresent: false,
          maskCount: 0,
          ribbonCount: false,
          coupleLabelPresent: false,
          shortDatePresent: false,
          skipTextPresent: false,
          heartFitsViewport: false,
          skipFitsViewport: false,
          noOverlapWithSkip: false,
        };
      }
      const sr = svg.getBoundingClientRect();
      const kr = skip.getBoundingClientRect();
      const txt = svg.textContent || '';
      return {
        overlayPresent: true,
        maskCount: masks.length,
        ribbonCount: ribbons.length === ${HEART_STROKES.length},
        coupleLabelPresent: txt.includes(${JSON.stringify(wedding.coupleLabel)}),
        shortDatePresent: txt.includes(${JSON.stringify(wedding.shortDate)}),
        skipTextPresent: true,
        heartFitsViewport: sr.left >= 0 && sr.top >= 0 && sr.right <= window.innerWidth && sr.bottom <= window.innerHeight,
        skipFitsViewport: kr.left >= 0 && kr.right <= window.innerWidth && kr.bottom <= window.innerHeight,
        noOverlapWithSkip: sr.bottom <= kr.top,
      };
    })()`)

    expect(drawingState.overlayPresent).toBe(true)
    expect(drawingState.maskCount).toBe(HEART_STROKES.length)
    expect(drawingState.ribbonCount).toBe(true)
    expect(drawingState.coupleLabelPresent).toBe(true)
    expect(drawingState.shortDatePresent).toBe(true)
    expect(drawingState.skipTextPresent).toBe(true)
    expect(drawingState.heartFitsViewport).toBe(true)
    expect(drawingState.skipFitsViewport).toBe(true)
    expect(drawingState.noOverlapWithSkip).toBe(true)

    // 2. Verify that at ~2.3s into the animation, the strokes and text inside the heart are fully visible
    await sleep(1950)
    const midAnimationState = await cdp.eval<{
      stillOpen: boolean
      namesOpacity: number
      dateOpacity: number
    }>(`(() => {
      const svg = document.querySelector('svg[viewBox="0 0 380 340"]');
      if (!svg) return { stillOpen: false, namesOpacity: 0, dateOpacity: 0 };
      const texts = svg.querySelectorAll('text');
      return {
        stillOpen: true,
        namesOpacity: texts[0] ? Number(getComputedStyle(texts[0]).opacity) : 0,
        dateOpacity: texts[1] ? Number(getComputedStyle(texts[1]).opacity) : 0,
      };
    })()`)

    expect(midAnimationState.stillOpen).toBe(true)
    expect(midAnimationState.namesOpacity).toBeGreaterThan(0.9)
    expect(midAnimationState.dateOpacity).toBeGreaterThan(0.9)

    // 3. Wait for the automatic completion (3.4s timer + 0.85s exit fade) and verify the intro unmounts on its own
    let introAutoDismissed = false
    for (let i = 0; i < 30; i++) {
      const overlayExists = await cdp.eval<boolean>(`Boolean(document.querySelector('div[role="presentation"]'))`)
      if (!overlayExists) {
        introAutoDismissed = true
        break
      }
      await sleep(100)
    }
    expect(introAutoDismissed).toBe(true)
  }, 15_000)

  it('replays the HeartIntro when clicking the heart divider button and skips early on click/tap', async () => {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    })

    // Click the heart divider button on the main page to replay the intro
    await cdp.eval(`
      document.querySelector('button[aria-label=${JSON.stringify(wedding.t.replayIntroAriaLabel)}]')?.click();
    `)
    await sleep(250)

    const replayed = await cdp.eval<boolean>(`Boolean(document.querySelector('svg[viewBox="0 0 380 340"]'))`)
    expect(replayed).toBe(true)

    // Click the intro overlay to skip early and verify it unmounts before the 3.4s timer
    await cdp.eval(`document.querySelector('div[role="presentation"]')?.click()`)
    let skippedCleanly = false
    for (let i = 0; i < 20; i++) {
      const overlayExists = await cdp.eval<boolean>(`Boolean(document.querySelector('div[role="presentation"]'))`)
      if (!overlayExists) {
        skippedCleanly = true
        break
      }
      await sleep(80)
    }
    expect(skippedCleanly).toBe(true)
  }, 10_000)

  it('skips the HeartIntro automatically on initial load when prefers-reduced-motion is enabled', async () => {
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    })
    await cdp.send('Page.navigate', { url: baseUrl })
    for (let i = 0; i < 25; i++) {
      const ready = await cdp.eval<boolean>(`Boolean(document.querySelector('h1'))`)
      if (ready) break
      await sleep(50)
    }

    const hasIntroOverlay = await cdp.eval<boolean>(`Boolean(document.querySelector('div[role="presentation"]'))`)
    expect(hasIntroOverlay).toBe(false)

    // Restore normal motion preference for subsequent tests
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
    })
  }, 10_000)

  it('ticks the countdown live every second and renders all configured wedding texts & metadata', async () => {
    const readTimerSnapshot = () =>
      cdp.eval<{
        htmlLang: string
        docTitle: string
        eyebrow: string
        headline: string
        longDate: string
        datetimeAttr: string
        locationNote: string
        unitLabels: string[]
        unitValues: number[]
        captionText: string
      }>(`(() => {
        const timer = document.querySelector('[role="timer"]');
        const units = timer ? Array.from(timer.children) : [];
        const unitValues = units.map(u => {
          const digits = Array.from(u.children[0].children).map(d => d.lastElementChild?.textContent?.trim() || '').join('');
          return Number(digits);
        });
        const unitLabels = units.map(u => u.children[1]?.textContent?.trim() || '');
        const timeEl = document.querySelector('time');
        return {
          htmlLang: document.documentElement.lang,
          docTitle: document.title,
          eyebrow: document.querySelector('main section > p')?.textContent?.trim() || '',
          headline: document.querySelector('h1')?.textContent?.replace(/\\s+/g, ' ').trim() || '',
          longDate: timeEl?.textContent?.trim() || '',
          datetimeAttr: timeEl?.getAttribute('datetime') || '',
          locationNote: document.querySelector('main section > p:last-of-type')?.textContent?.trim() || '',
          unitLabels,
          unitValues,
          captionText: timer?.nextElementSibling?.textContent?.replace(/\\s+/g, ' ').trim() || '',
        };
      })()`)

    const first = await readTimerSnapshot()
    expect(first.htmlLang).toBe(wedding.t.htmlLang)
    expect(first.docTitle).toBe(wedding.meta.title)
    expect(first.eyebrow).toBe(wedding.t.eyebrow)
    expect(first.headline).toBe(wedding.coupleLabel)
    expect(first.longDate).toBe(wedding.longDate)
    expect(first.datetimeAttr).toBe(wedding.date)
    expect(first.locationNote).toBe(wedding.location ?? wedding.locationFallback)
    expect(first.unitLabels).toEqual([
      wedding.t.countdown.days,
      wedding.t.countdown.hours,
      wedding.t.countdown.minutes,
      wedding.t.countdown.seconds,
    ])
    const expectedCaption =
      `${wedding.t.countdown.captionPrefix}${wedding.t.countdown.captionHighlight}${wedding.t.countdown.captionSuffix}`
        .replace(/\s+/g, ' ')
        .trim()
    expect(first.captionText).toBe(expectedCaption)

    // Wait ~1.25s and verify the live countdown actually decremented in the browser DOM
    await sleep(1250)
    const second = await readTimerSnapshot()
    const toTotalSeconds = (v: number[]) => v[0] * 86400 + v[1] * 3600 + v[2] * 60 + v[3]
    const delta = toTotalSeconds(first.unitValues) - toTotalSeconds(second.unitValues)
    expect(delta).toBeGreaterThanOrEqual(1)
    expect(delta).toBeLessThanOrEqual(2)
  }, 10_000)

  it('verifies all 4 calendar integrations, Escape/outside-click dismissal, and generated .ics & og-image endpoints', async () => {
    // Open the calendar dropdown
    await cdp.eval(`
      if (document.querySelector('button[aria-expanded="false"]')) {
        document.querySelector('button[aria-expanded="false"]').click();
      }
    `)
    await sleep(250)

    const menuItems = await cdp.eval<
      Array<{ label: string; href: string; download: string | null; target: string | null }>
    >(`(() => {
      return Array.from(document.querySelectorAll('main ul a')).map(a => ({
        label: a.querySelector('span')?.textContent?.trim() || '',
        href: a.getAttribute('href') || '',
        download: a.getAttribute('download'),
        target: a.getAttribute('target'),
      }));
    })()`)

    expect(menuItems).toHaveLength(4)
    expect(menuItems[0]).toEqual({
      label: wedding.t.calendar.apple,
      href: `./${wedding.icsFileName}`,
      download: null,
      target: null,
    })
    expect(menuItems[1].label).toBe(wedding.t.calendar.google)
    expect(menuItems[1].href).toContain('https://calendar.google.com/calendar/render?action=TEMPLATE')
    expect(menuItems[1].target).toBe('_blank')

    expect(menuItems[2].label).toBe(wedding.t.calendar.outlook)
    expect(menuItems[2].href).toContain('https://outlook.live.com/calendar/0/action/compose')
    expect(menuItems[2].target).toBe('_blank')

    expect(menuItems[3]).toEqual({
      label: wedding.t.calendar.otherIcs,
      href: `./${wedding.icsFileName}`,
      download: wedding.icsFileName,
      target: null,
    })

    // Dismiss dropdown with Escape key
    await cdp.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`)
    await sleep(300)
    expect(await cdp.eval<string>(`document.querySelector('button[aria-expanded]')?.getAttribute('aria-expanded')`)).toBe(
      'false',
    )

    // Re-open dropdown and dismiss by clicking outside (on the h1 headline)
    await cdp.eval(`document.querySelector('button[aria-expanded="false"]')?.click()`)
    await sleep(250)
    expect(await cdp.eval<string>(`document.querySelector('button[aria-expanded]')?.getAttribute('aria-expanded')`)).toBe(
      'true',
    )
    await cdp.eval(`document.querySelector('h1')?.click()`)
    await sleep(300)
    expect(await cdp.eval<string>(`document.querySelector('button[aria-expanded]')?.getAttribute('aria-expanded')`)).toBe(
      'false',
    )

    // Verify the dev server serves valid .ics and og-image.jpg assets
    const icsRes = await fetch(`${baseUrl}${wedding.icsFileName}`)
    expect(icsRes.status).toBe(200)
    expect(icsRes.headers.get('content-type')).toContain('text/calendar')
    const icsBody = await icsRes.text()
    expect(icsBody).toContain('BEGIN:VCALENDAR')
    expect(icsBody).toContain(`SUMMARY:${wedding.title}`)

    const ogRes = await fetch(`${baseUrl}og-image.jpg`)
    expect(ogRes.status).toBe(200)
    expect(ogRes.headers.get('content-type')).toContain('image/jpeg')
    const ogBytes = new Uint8Array(await ogRes.arrayBuffer())
    expect(ogBytes[0]).toBe(0xff)
    expect(ogBytes[1]).toBe(0xd8)
  }, 10_000)

  for (const vp of VIEWPORTS) {
    it(`displays all content without overflow, clipping, or overlap on ${vp.name}`, async () => {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.dpr,
        mobile: vp.mobile,
      })
      // Ensure intro is closed and scroll is reset
      await cdp.eval(`
        document.querySelector('div[role="presentation"]')?.click();
        window.scrollTo(0, 0);
      `)
      await stepDelay(45, 250)

      const report = await cdp.eval<{
        clientWidth: number
        scrollWidth: number
        photoLoaded: boolean
        photoRect: { left: number; top: number; width: number; height: number; right: number; bottom: number }
        contentRect: { left: number; top: number; width: number; height: number; right: number; bottom: number }
        elementsInBounds: boolean
        outOfBoundsDetails: string[]
        verticalOrderValid: boolean
        tilesAlignedAndContained: boolean
        tileDetails: string[]
      }>(`(() => {
        const rect = (el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, top: r.top, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
        };
        const cw = document.documentElement.clientWidth;
        const sw = document.documentElement.scrollWidth;
        const img = document.querySelector('figure img');
        const figure = document.querySelector('figure');
        const section = document.querySelector('main section');
        const h1 = document.querySelector('h1');
        const time = document.querySelector('time');
        const timer = document.querySelector('[role="timer"]');
        const calBtn = document.querySelector('button[aria-expanded]');

        const keyEls = [
          ['h1', h1],
          ['time', time],
          ['timer', timer],
          ['calendarButton', calBtn],
        ];
        const outOfBoundsDetails = [];
        for (const [name, el] of keyEls) {
          if (!el) {
            outOfBoundsDetails.push(name + ': missing');
            continue;
          }
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) outOfBoundsDetails.push(name + ': zero size');
          if (r.left < -1 || r.right > cw + 1) {
            outOfBoundsDetails.push(name + ': horizontal overflow (' + Math.round(r.left) + '..' + Math.round(r.right) + ' vs ' + cw + ')');
          }
          if (r.top < -1) {
            outOfBoundsDetails.push(name + ': clipped at top (' + Math.round(r.top) + ')');
          }
        }

        // Verify strict top-to-bottom order of content blocks
        const rH1 = h1.getBoundingClientRect();
        const rTime = time.getBoundingClientRect();
        const rTimer = timer.getBoundingClientRect();
        const rCal = calBtn.getBoundingClientRect();
        const verticalOrderValid =
          rH1.bottom <= rTime.top + 4 &&
          rTime.bottom <= rTimer.top + 4 &&
          rTimer.bottom <= rCal.top + 4;

        // Verify all 4 countdown tiles sit on one row and their labels/digits stay inside their tile borders
        const tiles = Array.from(timer.children);
        const tileDetails = [];
        const t0 = tiles[0].getBoundingClientRect();
        tiles.forEach((tile, idx) => {
          const tr = tile.getBoundingClientRect();
          if (Math.abs(tr.top - t0.top) > 2) {
            tileDetails.push('tile ' + idx + ' wrapped to new row');
          }
          if (idx > 0) {
            const prev = tiles[idx - 1].getBoundingClientRect();
            if (tr.left < prev.right - 1) {
              tileDetails.push('tile ' + idx + ' overlaps previous tile');
            }
          }
          for (const child of tile.children) {
            const cr = child.getBoundingClientRect();
            if (cr.left < tr.left - 1 || cr.right > tr.right + 1) {
              tileDetails.push('tile ' + idx + ' child "' + child.textContent + '" overflows tile (' + Math.round(cr.width) + ' > ' + Math.round(tr.width) + ')');
            }
          }
        });

        return {
          clientWidth: cw,
          scrollWidth: sw,
          photoLoaded: Boolean(img && img.complete && img.naturalWidth > 0),
          photoRect: rect(figure),
          contentRect: rect(section),
          elementsInBounds: outOfBoundsDetails.length === 0,
          outOfBoundsDetails,
          verticalOrderValid,
          tilesAlignedAndContained: tileDetails.length === 0,
          tileDetails,
        };
      })()`)

      expect(report.scrollWidth, `${vp.name}: horizontal page overflow`).toBeLessThanOrEqual(report.clientWidth)
      expect(report.photoLoaded, `${vp.name}: photo loaded`).toBe(true)
      expect(report.outOfBoundsDetails, `${vp.name}: elements in bounds`).toEqual([])
      expect(report.verticalOrderValid, `${vp.name}: vertical element order`).toBe(true)
      expect(report.tileDetails, `${vp.name}: countdown tiles`).toEqual([])

      if (vp.width >= 900) {
        // Desktop / landscape-tablet split layout: photo on left 50%, content on right 50%
        expect(Math.abs(report.photoRect.width - vp.width / 2)).toBeLessThanOrEqual(2)
        expect(report.contentRect.left).toBeGreaterThanOrEqual(report.photoRect.right - 2)
      } else {
        // Mobile / portrait-tablet stacked layout: photo full width at top
        expect(Math.abs(report.photoRect.width - report.clientWidth)).toBeLessThanOrEqual(1)
        expect(report.contentRect.top).toBeGreaterThan(report.photoRect.top)
      }

      // Open calendar dropdown and verify all 4 options are rendered and within horizontal bounds
      await cdp.eval(`document.querySelector('button[aria-expanded]')?.click()`)
      await stepDelay(180, 280)

      const menuReport = await cdp.eval<{
        optionCount: number
        allWithinWidth: boolean
        scrollWidth: number
        clientWidth: number
        topNotClipped: boolean
      }>(`(() => {
        const cw = document.documentElement.clientWidth;
        const sw = document.documentElement.scrollWidth;
        const links = Array.from(document.querySelectorAll('main ul a'));
        const h1 = document.querySelector('h1').getBoundingClientRect();
        const allWithinWidth = links.every((a) => {
          const r = a.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.left >= 0 && r.right <= cw + 1;
        });
        return {
          optionCount: links.length,
          allWithinWidth,
          scrollWidth: sw,
          clientWidth: cw,
          topNotClipped: h1.top >= 0,
        };
      })()`)

      expect(menuReport.optionCount, `${vp.name}: 4 calendar options`).toBe(4)
      expect(menuReport.allWithinWidth, `${vp.name}: calendar options within viewport width`).toBe(true)
      expect(menuReport.scrollWidth, `${vp.name}: no horizontal overflow with menu open`).toBeLessThanOrEqual(
        menuReport.clientWidth,
      )
      expect(menuReport.topNotClipped, `${vp.name}: headline not clipped at top when menu opens`).toBe(true)

      // Close menu for next viewport
      await cdp.eval(`document.querySelector('button[aria-expanded]')?.click()`)
      await sleep(50)
    })
  }
})
