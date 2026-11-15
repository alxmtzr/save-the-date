# Save the Date – Wedding Website Template

A modern, minimalist single-page **Save the Date** website built with **Vite, React 19, TypeScript, and Motion**, ready to deploy on **GitHub Pages**.

Every name, date, text, calendar invite (`save-the-date.ics`), HTML `<meta>` tag, and Open Graph link preview (`og-image.jpg`) is generated from a single configuration file ([`src/config.ts`](src/config.ts))—so you can reuse this repository for any wedding in two minutes.

---

## Preview

### Desktop (Split Layout)

![Desktop Split Layout](docs/screenshots/desktop.png)

### Intro Animation & Mobile Views

| Calligraphic Heart (Drawing) | Calligraphic Heart (Complete) | Mobile View | Calendar Menu |
| :---: | :---: | :---: | :---: |
| ![Intro Drawing](docs/screenshots/intro-draw.png) | ![Intro Complete](docs/screenshots/intro-date.png) | ![Mobile View](docs/screenshots/mobile.png) | ![Calendar Menu](docs/screenshots/mobile-menu.png) |

### WhatsApp / iMessage Link Preview (`og-image.jpg`)

 Automatically generated at build time with your configured names and date:

![Open Graph Preview](docs/screenshots/og-image.jpg)

---

## Features

- **Calligraphic Hand-Drawn Intro:** Variable-width nib strokes drawn via animated SVG masks with crossing ribbons, an open heart cleft, and your custom names & date inside. Tap anywhere to skip, or click the small heart divider on the main page to replay anytime. Respects `prefers-reduced-motion`.
- **Responsive Editorial Layout:** Full-bleed vertical fade on mobile (`< 900px`) and a 50/50 split screen on desktop (`≥ 900px`).
- **Build-Time Image Optimization:** Uses `vite-imagetools` to automatically generate responsive `AVIF`, `WebP`, and `JPEG` `srcset` variants (`640w`, `960w`, `1280w`, `1500w`) from a single photo.
- **Smooth Rolling Countdown:** Live days, hours, minutes, and seconds counter aligned to exact second boundaries.
- **One-Click Calendar Integration:** Supports **Apple Calendar**, **Google Calendar**, **Outlook**, and a standards-compliant **RFC 5545 `.ics` download** (`save-the-date.ics` with 7-day `VALARM` reminder) generated at build time from `src/config.ts`.
- **Automatic Open Graph Card:** Dynamically generates a `1200 × 630` JPEG preview card (`og-image.jpg`) and Open Graph `<meta>` tags from `src/config.ts` so links shared in WhatsApp, iMessage, or Signal display a clean calligraphy card while keeping the couple photo as a surprise.
- **Privacy-Friendly & Self-Hosted Fonts:** Bundled locally via `@fontsource-variable` (`Cormorant Garamond` & `Inter`) with zero external requests to Google Fonts, plus `noindex, nofollow` meta tags.

---

## Reusing This Template for Your Own Wedding

### 1. Replace the Photo

Replace [`src/assets/couple.jpg`](src/assets/couple.jpg) with your own portrait/vertical photo (recommended resolution: at least `1200 × 1600 px`).
All responsive `AVIF`, `WebP`, and `JPEG` sizes are generated automatically during `npm run build`.

### 2. Edit [`src/config.ts`](src/config.ts)

Update your names, wedding date, countdown target, and optional venue in [`src/config.ts`](src/config.ts):

```ts
export const wedding: Wedding = defineWedding({
  names: ['Chiara', 'Alex'],
  date: '2027-09-25',
  countdownTarget: '2027-09-25T00:00:00+02:00',
  location: undefined,        // e.g. 'Munich' — displays locationFallback ('Einladung folgt') when undefined
  photoPosition: '55% 35%',   // CSS object-position to keep faces centered
})
```

Changing `src/config.ts` automatically updates:
- The hero headline, formatted date, and photo `alt` text
- The calligraphic heart intro animation (`names` and `DD · MM · YY` date)
- The countdown timer target
- Google Calendar, Outlook, and Apple Calendar / `.ics` (`save-the-date.ics`) invites
- HTML `<title>`, `<meta name="description">`, Open Graph tags, and the generated `og-image.jpg` link preview image

*(Optional)* To customize colors, adjust the CSS custom properties in [`src/styles/global.css`](src/styles/global.css).

---

## Local Development

```bash
npm install
npm run dev            # start local dev server at http://localhost:5173/
npm run dev -- --host  # expose dev server on local Wi-Fi (for testing on iPhone / Android)
npm test               # run Vitest unit tests
npm run lint           # run Oxlint
npm run build          # typecheck & build production bundle into dist/
npm run preview        # preview production build locally at http://localhost:4173/
```

---

## Deploying to GitHub Pages

1. Push your repository to GitHub (`main` branch).
2. In your GitHub repository, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. The included workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) automatically runs tests, builds the site (injecting the absolute GitHub Pages URL for WhatsApp/Open Graph previews), and deploys to `https://<username>.github.io/<repo-name>/`.
