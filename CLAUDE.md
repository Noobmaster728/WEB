# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing and lead-generation site for Jesús Hernández, a personal trainer who prepares candidates for the physical tests of Spanish public-service exams (Policía Nacional, Guardia Civil, Bomberos, Policía Local/Municipal, Fuerzas Armadas). All user-facing content is in Spanish (es-ES).

The user explicitly chose **plain HTML, CSS and vanilla JS: no frameworks, no build step, no npm**. Don't reintroduce Astro, Tailwind, bundlers or other tooling.

## Running

There is nothing to build. Open `index.html` directly in a browser, or serve the folder statically (e.g. `npx serve .`). `404.html` uses root-absolute paths, so it only renders correctly when served from the domain root. Deploy by uploading the folder to any static host.

There are no automated tests. The calculator's scoring logic was verified by extracting `scoreTest`/`parseMark`/`fmtMark` from `main.js` with Node and checking known marks against the official tables. Re-verify that way after touching scoring code or `data.js`.

## Architecture

- `index.html` is a single landing page. Its sections, in order: hero, credentials, problem/solution, oposiciones tabs, calculator, method, plans, about, testimonials, multi-step lead form (`#test`), FAQ, CTA.
- Legal pages: `aviso-legal.html`, `privacidad.html` and `cookies.html`. Other pages: `gracias.html` (shown after the form) and `404.html`.
- The three scripts are classic `<script>` tags, not ES modules, so the site works over `file://`. Load order matters:
  1. `assets/js/config.js` sets `window.SITE`: contact, WhatsApp number, city, prices, photo, testimonials and lead endpoints. Placeholders are marked `TODO`. Owner-editable settings belong here, not hard-coded in HTML.
  2. `assets/js/data.js` sets `window.CALC_DATA`, the official scoring tables. Each oposición has a `type`:
     - `steps`: threshold table of `[mark, points]`, where each mark is the worst mark that still earns those points.
     - `interp`: marks for 5…10 points with linear interpolation.
     - `apto`: a minimum mark only, optionally per age band through `ages`.

     `dir` is `low` (less is better) or `high`. Times are in seconds. Fields can be sex-specific as `{H, M}`.
  3. `assets/js/main.js` is one IIFE. It fills `[data-site]` and `[data-wa]` elements from config and also handles the tabs, the calculator, the 3-step lead form and `sendLead()`.
- **Lead flow:** the form POSTs JSON to Web3Forms (`leads.web3formsKey`) and/or a webhook (`leads.webhookUrl`). It then stores a summary in `sessionStorage` (`jh_lead`) and redirects to `gracias.html`. If nothing is configured or delivery fails, it redirects to `gracias.html?wa=1`, which asks the user to send the pre-written WhatsApp message, so leads are never lost. The calculator can pre-fill the form (oposición plus a marks summary in the hidden `calculadora` field).
- `main.js` pushes analytics events to `window.dataLayer`, but no analytics script is loaded. `cookies.html` states the site uses no cookies. If you add GA4 or a Meta pixel, you must add a consent banner and update `cookies.html` and `privacidad.html`.
- `assets/css/styles.css` holds design tokens in `:root` (dark theme, orange brand `--brand`, per-oposición accents `--op-*`). Fonts are self-hosted in `assets/fonts/` to stay GDPR-friendly: don't link Google Fonts.

## Data accuracy rules

- Physical-test marks appear in **two places** that must stay in sync: the static tables in the `#oposiciones` panels of `index.html` (for SEO) and `assets/js/data.js` (for the calculator).
- Every mark comes from an official bulletin (BOE, BOJA, BOCM, BOAM), and its source is cited next to it. Never add marks from academy websites or from memory. Last review: October 2026.
- Bomberos has no calculator. Tests differ for each convocatoria, and the scoring table of the Comunidad de Madrid 2026 order couldn't be extracted reliably.
- Testimonials must be real. The section stays hidden while `SITE.testimonials` is empty. Never invent testimonials, client counts or results.

## Placeholders to replace before launch

- `TODO` values in `config.js`.
- The `https://www.tudominio.es` domain in `index.html` (canonical, og and JSON-LD), `robots.txt` and `sitemap.xml`.
- `[BRACKETED]` owner data in the legal pages.
- An optional `assets/img/og.jpg` (1200×630).
