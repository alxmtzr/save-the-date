import { spawn, type ChildProcess } from 'node:child_process'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createServer, type ViteDevServer } from 'vite'
import { wedding } from '../config.ts'

interface Viewport {
  name: string
  width: number
  height: number
  dpr: number
  mobile: boolean
}

const VIEWPORTS: readonly Viewport[] = [
  // Small & compact phones
  { name: 'iPhone SE (320x568)', width: 320, height: 568, dpr: 2, mobile: true },
  { name: 'Galaxy Z Fold Cover (344x882)', width: 344, height: 882, dpr: 3, mobile: true },
  { name: 'Android Compact (360x800)', width: 360, height: 800, dpr: 3, mobile: true },
  { name: 'iPhone 13 Mini / SE 3 (375x667)', width: 375, height: 667, dpr: 2, mobile: true },
  // Standard & Pro Max phones
  { name: 'iPhone 14 / 15 / 16 (390x844)', width: 390, height: 844, dpr: 3, mobile: true },
  { name: 'iPhone 16 Pro (402x874)', width: 402, height: 874, dpr: 3, mobile: true },
  { name: 'Pixel 8 / Galaxy S24+ (412x915)', width: 412, height: 915, dpr: 2.6, mobile: true },
  { name: 'iPhone 16 Pro Max (440x956)', width: 440, height: 956, dpr: 3, mobile: true },
  // Mobile landscape
  { name: 'Mobile Landscape (844x390)', width: 844, height: 390, dpr: 2, mobile: true },
  // Tablets (portrait & landscape)
  { name: 'iPad Mini / Air Portrait (768x1024)', width: 768, height: 1024, dpr: 2, mobile: true },
  { name: 'iPad Pro 11" Portrait (834x1194)', width: 834, height: 1194, dpr: 2, mobile: true },
  { name: 'iPad Landscape (1024x768)', width: 1024, height: 768, dpr: 2, mobile: true },
  // Laptops & Desktops
  { name: '13" Compact Laptop (1280x720)', width: 1280, height: 720, dpr: 2, mobile: false },
  { name: '14" Standard Laptop (1366x768)', width: 1366, height: 768, dpr: 1, mobile: false },
  { name: 'MacBook Air / Pro (1440x900)', width: 1440, height: 900, dpr: 2, mobile: false },
  { name: 'Full HD Laptop / Desktop (1920x1080)', width: 1920, height: 1080, dpr: 1, mobile: false },
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
    this.ws.close()
  }
}

describe('Multi-Device UI & Responsive Layout Suite', () => {
  let server: ViteDevServer
  let baseUrl: string
  let chrome: ChildProcess
  let cdp: CdpSession

  beforeAll(async () => {
    server = await createServer({ server: { port: 0, host: '127.0.0.1' }, logLevel: 'silent' })
    await server.listen()
    const addr = server.httpServer?.address()
    const port = typeof addr === 'object' && addr ? addr.port : 5173
    baseUrl = `http://127.0.0.1:${port}/`

    const debugPort = 9600 + Math.floor(Math.random() * 300)
    chrome = spawn(
      'google-chrome',
      [
        ...(isHeaded ? ['--new-window', '--window-size=1280,960'] : ['--headless=new', '--disable-gpu']),
        '--no-sandbox',
        '--hide-scrollbars',
        `--remote-debugging-port=${debugPort}`,
        `--user-data-dir=/tmp/std-vitest-cdp-${debugPort}`,
        'about:blank',
      ],
      { stdio: 'ignore' },
    )

    let targets: Array<{ type: string; webSocketDebuggerUrl: string }> = []
    for (let i = 0; i < 50; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${debugPort}/json`)
        targets = (await res.json()) as Array<{ type: string; webSocketDebuggerUrl: string }>
        break
      } catch {
        await sleep(100)
      }
    }

    const page = targets.find((t) => t.type === 'page')!
    cdp = new CdpSession()
    await cdp.connect(page.webSocketDebuggerUrl)
    await cdp.send('Page.enable')
    await cdp.send('Page.navigate', { url: baseUrl })

    // Wait for initial React render and image load
    for (let i = 0; i < 40; i++) {
      const ready = await cdp.eval<boolean>(
        `Boolean(document.querySelector('main img')?.complete && document.querySelector('h1'))`,
      )
      if (ready) break
      await sleep(100)
    }
  }, 25_000)

  afterAll(async () => {
    cdp?.close()
    chrome?.kill()
    await server?.close()
  })

  it('renders and dismisses the calligraphic HeartIntro cleanly on mobile and laptop viewports', async () => {
    for (const vp of [VIEWPORTS[0], VIEWPORTS[4], VIEWPORTS[14]]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.dpr,
        mobile: vp.mobile,
      })

      // Trigger intro replay via the heart button if not currently open
      await cdp.eval(`
        if (!document.querySelector('svg[viewBox="0 0 380 340"]')) {
          document.querySelector('button[aria-label*="Herz-Animation"]')?.click();
        }
      `)
      await sleep(150)

      const introCheck = await cdp.eval<{
        hasSvg: boolean
        heartFitsViewport: boolean
        skipFitsViewport: boolean
        noOverlapWithSkip: boolean
        textContent: string
      }>(`(() => {
        const svg = document.querySelector('svg[viewBox="0 0 380 340"]');
        const skip = Array.from(document.querySelectorAll('span')).find(s => s.textContent?.includes('Überspringen'));
        if (!svg || !skip) return { hasSvg: false, heartFitsViewport: false, skipFitsViewport: false, noOverlapWithSkip: false, textContent: '' };
        const sr = svg.getBoundingClientRect();
        const kr = skip.getBoundingClientRect();
        return {
          hasSvg: true,
          heartFitsViewport: sr.left >= 0 && sr.top >= 0 && sr.right <= window.innerWidth && sr.bottom <= window.innerHeight,
          skipFitsViewport: kr.left >= 0 && kr.right <= window.innerWidth && kr.bottom <= window.innerHeight,
          noOverlapWithSkip: sr.bottom <= kr.top,
          textContent: svg.textContent || '',
        };
      })()`)

      expect(introCheck.hasSvg, vp.name).toBe(true)
      expect(introCheck.heartFitsViewport, vp.name).toBe(true)
      expect(introCheck.skipFitsViewport, vp.name).toBe(true)
      expect(introCheck.noOverlapWithSkip, vp.name).toBe(true)
      expect(introCheck.textContent).toContain(wedding.coupleLabel)
      expect(introCheck.textContent).toContain(wedding.shortDate)

      // Click overlay to skip intro and wait for exit transition
      await cdp.eval(`document.querySelector('div[role="presentation"]')?.click()`)
      await sleep(950)
    }
  }, 15_000)

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
      await stepDelay(60, 450)

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
      await stepDelay(220, 450)

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
