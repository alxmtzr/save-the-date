# Save the Date – Wedding Website Template

A modern, minimalist single-page **Save the Date** website built with **Vite, React 19, TypeScript, and Motion**, ready to deploy on **GitHub Pages**.

Every variable—including **language (`locale: 'de' | 'en' | ...`)**, couple names, wedding date, countdown target, **photo file path**, calendar invite (`save-the-date.ics`), HTML `<meta>` tags, and Open Graph link preview (`og-image.jpg`)—is configured in a single root configuration file ([`wedding.config.ts`](wedding.config.ts)), with a ready-to-copy template in [`wedding.config.template.ts`](wedding.config.template.ts). Nothing is hardcoded in the application code.

---

## Preview

*(Shown with the placeholder configuration from [`wedding.config.template.ts`](wedding.config.template.ts): **Emma & Noah · June 17, 2028**)*

### Desktop (Split Layout)

![Desktop Split Layout](docs/screenshots/desktop.png)

### Intro Animation & Mobile Views

| Calligraphic Heart (Drawing) | Calligraphic Heart (Complete) | Mobile View | Calendar Menu |
| :---: | :---: | :---: | :---: |
| ![Intro Drawing](docs/screenshots/intro-draw.png) | ![Intro Complete](docs/screenshots/intro-date.png) | ![Mobile View](docs/screenshots/mobile.png) | ![Calendar Menu](docs/screenshots/mobile-menu.png) |

### WhatsApp / iMessage Link Preview (`og-image.jpg`)

Automatically generated at build time with the configured names and date:

![Open Graph Preview](docs/screenshots/og-image.jpg)

---

## Features

- **Zero Hardcoded Data (`wedding.config.ts`):** Set language (`locale`), names, date, countdown timestamp, venue, and image path in [`wedding.config.ts`](wedding.config.ts). Use [`wedding.config.template.ts`](wedding.config.template.ts) as a clean starting template.
- **Built-in & Extensible i18n (`de` / `en` + Custom Languages):** Ships with full **German (`de`)** and **English (`en`)** translations, automatic `Intl.DateTimeFormat` date localization, localized calendar invites, and `<html lang="...">` injection. Easily extensible to any language via [`src/i18n/locales.ts`](src/i18n/locales.ts) or inline `translations` overrides in `wedding.config.ts`.
- **Calligraphic Hand-Drawn Intro:** Variable-width nib strokes drawn via animated SVG masks with crossing ribbons, an open heart cleft, and your custom names & date inside. Tap anywhere to skip, or click the small heart divider on the main page to replay anytime. Respects `prefers-reduced-motion`.
- **Responsive Editorial Layout:** Full-bleed vertical fade on mobile (`< 900px`) and a 50/50 split screen on desktop (`≥ 900px`).
- **Build-Time Image Optimization:** Uses `vite-imagetools` to automatically generate responsive `AVIF`, `WebP`, and `JPEG` `srcset` variants (`640w`, `960w`, `1280w`, `1500w`) for the image configured in `wedding.config.ts`.
- **Smooth Rolling Countdown:** Live days, hours, minutes, and seconds counter aligned to exact second boundaries.
- **One-Click Calendar Integration:** Supports **Apple Calendar**, **Google Calendar**, **Outlook**, and a standards-compliant **RFC 5545 `.ics` download** (`save-the-date.ics` with 7-day `VALARM` reminder) generated at build time.
- **Automatic Open Graph Card:** Dynamically generates a `1200 × 630` JPEG preview card (`og-image.jpg`) and Open Graph `<meta>` tags from `wedding.config.ts` so links shared in WhatsApp, iMessage, or Signal display a clean calligraphy card while keeping the couple photo as a surprise.
- **Multi-Device Headless UI Test Suite:** Automated real-browser tests across 37 Android, iPhone, foldable, tablet, laptop, and monitor viewports (`320×568` up to `2560×1440`), plus full end-to-end checks for the calligraphic intro animation, live countdown, and calendar integrations.
- **Privacy-Friendly & Self-Hosted Fonts:** Bundled locally via `@fontsource-variable` (`Cormorant Garamond` & `Inter`) with zero external requests to Google Fonts, plus `noindex, nofollow` meta tags.

---

## Reusing This Template for Your Own Wedding

### 1. Copy the Template to `wedding.config.ts`

Copy [`wedding.config.template.ts`](wedding.config.template.ts) (removing the `.template` suffix) to [`wedding.config.ts`](wedding.config.ts):

```bash
cp wedding.config.template.ts wedding.config.ts
```

### 2. Add Your Photo & Configure [`wedding.config.ts`](wedding.config.ts)

Place your photo in `src/assets/` (for example `src/assets/my-photo.jpg`, recommended portrait resolution: `1200 × 1600 px` or higher) and edit [`wedding.config.ts`](wedding.config.ts):

```ts
import { defineWedding } from './src/weddingSchema.ts'

export default defineWedding({
  locale: 'en', // 'de' (German) or 'en' (English), or any custom locale
  names: ['Emma', 'Noah'],
  date: '2028-06-17',
  countdownTarget: '2028-06-17T00:00:00+02:00',
  image: 'src/assets/sample-couple.jpg',
  photoPosition: '50% 35%', // CSS object-position to keep faces centered
  location: undefined,      // e.g. 'Munich' — displays localized fallback when undefined
  icsFileName: 'save-the-date.ics',
})
```

### 3. Language & i18n Customization

- **Switch between German and English:** Set `locale: 'de'` or `locale: 'en'` in [`wedding.config.ts`](wedding.config.ts). All UI labels (countdown units, *"bis wir Ja sagen"* / *"until we say I do"*, calendar menu, skip button, accessibility labels), the long date format (*"17. Juni 2028"* vs. *"June 17, 2028"*), and calendar/Open Graph defaults switch automatically.
- **Override individual strings inline:** Pass a `translations` object in `wedding.config.ts` to customize any phrase without editing component files:
  ```ts
  translations: {
    countdown: {
      captionPrefix: 'until we say ',
      captionHighlight: 'Yes',
      captionSuffix: '!',
    },
  }
  ```
- **Add a new language:** Add a dictionary in [`src/i18n/locales.ts`](src/i18n/locales.ts) (or call `registerLocale('fr', { ... })`) and set `locale: 'fr'` in `wedding.config.ts`.

---

## Local Development & Testing

```bash
npm install
npm run dev              # start local dev server at http://localhost:5173/
npm run dev -- --host    # expose dev server on local Wi-Fi (for testing on iPhone / Android)
npm test                 # run unit tests + 37-device headless Chrome UI & functional suite
npm run test:ui:headed   # watch the 37-device UI test suite live in a clean Chrome test window
npm run lint             # run Oxlint
npm run build            # typecheck & build production bundle into dist/
npm run preview          # preview production build locally at http://localhost:4173/
```

---

## Deploying to GitHub Pages

1. Push your repository to GitHub (`main` branch).
2. In your GitHub repository, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. The included workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) automatically runs tests, builds the site (injecting the absolute GitHub Pages URL for WhatsApp/Open Graph previews), and deploys to `https://<username>.github.io/<repo-name>/`.
