# Ayush Care — "Rooted in You"

Kerala wellness rituals storefront. React frontend, Go backend, in separate folders.

![Home page, desktop](docs/home-desktop.png)

| Malayalam mode | Mobile |
| --- | --- |
| ![Malayalam](docs/home-malayalam.png) | <img src="docs/home-mobile.png" width="260" alt="Mobile"> |

[Full page screenshot](docs/home-full.png)

**Live demo:** https://fourandhalf.github.io/ayush-care/ — available once the Pages workflow has run on `main` (see [Publishing](#publishing-the-frontend)).

## Repo layout

```
frontend/   React + Vite app (the website)
backend/    Go HTTP API (net/http, no dependencies)
docs/       Screenshots used in this README
.github/    GitHub Pages deploy workflow
```

## Run locally

```bash
cd backend && go run .                      # http://localhost:8080
```

```bash
cd frontend && npm install && npm run dev   # http://localhost:5173 (proxies /api to the backend)
```

Backend env: `PORT` (default 8080), `CORS_ORIGIN` (default `http://localhost:5173`).

## How the frontend was made

The page was implemented from a design mock (an HTML prototype) and ported to React.

- **Stack:** React 19 + Vite, plain CSS (`frontend/src/styles.css`), no UI library.
- **Structure:** `src/App.jsx` holds the page sections (header, hero, statement, testimonials, vaidyar, footer). `src/components/Carousel.jsx` is the banner and `src/components/Rituals.jsx` the product cards. `src/components/bits.jsx` has shared pieces (stars, photo frame, icons).
- **Bilingual copy:** `src/lang.jsx` provides a language context and a `<T en="…" ml="…" />` component. The EN / മലയാളം toggle swaps every string and sets `<html lang>`.
- **Design tokens:** colours, type (Instrument Serif / Instrument Sans / Manjari), spacing and the kasavu border are CSS variables and rules taken from the mock.
- **Interactions:** the banner auto-advances every 8 s, pauses on hover/focus or via the pause button, and has arrows and dots. The "new mother" card has kit chips that change the price. The accordions use native `<details>`.
- **Accessibility:** radio-group roles on the language and kit toggles, labelled carousel controls, visible focus rings, and `prefers-reduced-motion` support.
- **Placeholder assets:** all photos are generated gradient SVGs in `frontend/public/placeholders/` (`p1.svg` … `p10.svg`); the kasavu border and linen background are SVG tiles too. To use real photos, replace those files or change the `n` prop on `<Photo>`. Captions starting with "Your photo:" are art-direction notes from the mock; delete them when real photos go in.
- **Backend link:** the Vite dev server proxies `/api/*` to the Go server. The page does not call the API yet.

## Publishing the frontend

`.github/workflows/pages.yml` builds `frontend/` and deploys it to GitHub Pages on every push to `main`. One-time setup:

1. Merge this branch into `main`.
2. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The workflow builds with `VITE_BASE=/<repo-name>/`, so assets resolve under the Pages sub-path. The site appears at the URL shown in the workflow run.

To build by hand: `cd frontend && VITE_BASE=/ayush-care/ npm run build`.
