import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { imagetools } from 'vite-imagetools'
import { wedding } from './src/config.ts'
import { buildIcs } from './src/lib/calendar.ts'

/** Erzeugt die .ics-Datei aus src/config.ts, damit Seite und Kalendereintrag nie auseinanderlaufen. */
function icsFile(): Plugin {
  return {
    name: 'wedding-ics',
    configureServer(server) {
      server.middlewares.use(`/${wedding.icsFileName}`, (_req, res) => {
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
        res.end(buildIcs(wedding))
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: wedding.icsFileName, source: buildIcs(wedding) })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), imagetools(), icsFile()],
})
