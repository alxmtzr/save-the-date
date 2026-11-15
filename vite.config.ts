import path from 'node:path'
import react from '@vitejs/plugin-react'
import sharp from 'sharp'
import { defineConfig, type Plugin } from 'vite'
import { imagetools } from 'vite-imagetools'
import { HEART_STROKES } from './src/components/heartPaths.ts'
import { wedding, type Wedding } from './src/config.ts'
import { buildIcs } from './src/lib/calendar.ts'

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

const STROKE_STYLE: Record<string, string> = {
  primary: 'fill="#c8754f"',
  primaryDeep: 'fill="#b5643f"',
  echo: 'fill="#c8754f" fill-opacity="0.48"',
  swash: 'fill="#c8754f" fill-opacity="0.8"',
}

async function buildOgImage(w: Wedding): Promise<Buffer> {
  const strokesSvg = HEART_STROKES.map((s) => `<path d="${s.ribbon}" ${STROKE_STYLE[s.variant]}/>`).join('\n    ')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#faf6f0"/>
  <defs>
    <radialGradient id="glow" cx="50%" cy="48%" r="44%">
      <stop offset="0%" stop-color="#ebc3a2" stop-opacity="0.4"/>
      <stop offset="65%" stop-color="#ebc3a2" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#faf6f0" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <svg x="350" y="91" width="500" height="448" viewBox="0 0 380 340">
    <ellipse cx="190" cy="158" rx="145" ry="125" fill="url(#glow)"/>
    ${strokesSvg}
    <text x="190" y="146" text-anchor="middle" font-family="Georgia, 'DejaVu Serif', serif" font-style="italic" font-size="17" fill="#8a7d74" letter-spacing="1.4">${escapeXml(w.coupleLabel)}</text>
    <text x="190" y="182" text-anchor="middle" font-family="Georgia, 'DejaVu Serif', serif" font-size="27" fill="#2e2622" letter-spacing="2.2">${escapeXml(w.shortDate)}</text>
  </svg>
</svg>`

  return sharp(Buffer.from(svg)).jpeg({ quality: 90, mozjpeg: true }).toBuffer()
}

/** Resolves the configured wedding photo and emits HTML metadata, the .ics file, and the Open Graph image. */
function weddingConfigPlugin(): Plugin {
  return {
    name: 'wedding-config',
    enforce: 'pre',
    resolveId(source) {
      if (source === '@wedding-photo' || source.startsWith('@wedding-photo?')) {
        const query = source.slice('@wedding-photo'.length)
        return path.resolve(import.meta.dirname, wedding.image) + query
      }
    },
    transformIndexHtml(html) {
      return html
        .replaceAll('__HTML_LANG__', escapeXml(wedding.t.htmlLang))
        .replaceAll('__META_TITLE__', escapeXml(wedding.meta.title))
        .replaceAll('__META_DESCRIPTION__', escapeXml(wedding.meta.description))
        .replaceAll('__OG_TITLE__', escapeXml(wedding.meta.ogTitle))
        .replaceAll('__OG_DESCRIPTION__', escapeXml(wedding.meta.ogDescription))
    },
    configureServer(server) {
      server.middlewares.use(`/${wedding.icsFileName}`, (_req, res) => {
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
        res.end(buildIcs(wedding))
      })
      server.middlewares.use('/og-image.jpg', async (_req, res) => {
        const buf = await buildOgImage(wedding)
        res.setHeader('Content-Type', 'image/jpeg')
        res.end(buf)
      })
    },
    async generateBundle() {
      this.emitFile({ type: 'asset', fileName: wedding.icsFileName, source: buildIcs(wedding) })
      this.emitFile({ type: 'asset', fileName: 'og-image.jpg', source: await buildOgImage(wedding) })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [weddingConfigPlugin(), react(), imagetools()],
})
