# Save the Date – Chiara & Alex

Einseitige Save-the-Date-Webseite für den **25.09.2027** (Vite + React + TypeScript + Motion).

## Entwicklung

```bash
npm install
npm run dev       # lokaler Dev-Server
npm test          # Unit-Tests (Kalender, Countdown)
npm run build     # Produktions-Build nach dist/
npm run preview   # Build lokal ansehen
```

Alle Inhalte (Namen, Datum, Ort, Kalendertext) stehen zentral in [`src/config.ts`](src/config.ts).
Die Datei `hochzeit-chiara-alex.ics` wird beim Build daraus erzeugt. Steht der Ort fest,
einfach `location` setzen – Seite und Kalendereinträge übernehmen ihn automatisch.

## Veröffentlichen auf GitHub Pages

1. Repository auf GitHub anlegen (z. B. `save-the-date`) und pushen:
   ```bash
   git remote add origin git@github.com:<user>/save-the-date.git
   git push -u origin main
   ```
2. Auf GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Der Workflow `.github/workflows/deploy.yml` baut und veröffentlicht die Seite bei jedem Push
   auf `main` unter `https://<user>.github.io/save-the-date/`.

Die Seite ist per `noindex` von Suchmaschinen ausgeschlossen, aber für alle mit dem Link öffentlich.
