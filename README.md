# foschiera.com

Personal site of Ivan Foschiera, served by GitHub Pages at [foschiera.com](https://foschiera.com).

## Structure

- `index.html` — the whole site (single page), including an inline Lucide SVG icon sprite
- `style.css` — design tokens, fonts, components, and all accessibility/motion gates
- `script.js` — scroll reveal, stat counters, mobile menu, hide-on-scroll header (loaded with `defer`)
- `assets/tailwind.css` — **compiled** Tailwind utilities (do not edit by hand)
- `assets/fonts/` — self-hosted Sora + DM Sans variable fonts (woff2, latin subset)
- `assets/Ivan-Foschiera-CV.pdf` — downloadable CV linked from the hero and contact sections
- `favicon.svg`, `assets/apple-touch-icon.png`, `assets/og-image.jpg` — brand/preview assets

## Editing

Content and styling live in `index.html` (Tailwind utility classes) and `style.css` (custom CSS).

**If you add/remove Tailwind classes in `index.html` or `script.js`, rebuild the CSS:**

```sh
npm install        # once
npm run build      # compiles src/input.css -> assets/tailwind.css
npm run watch      # or rebuild on every change while working
```

Commit the regenerated `assets/tailwind.css` together with your change — GitHub Pages serves static files only, there is no build step on deploy.

The fluid type scale (clamp-based) is defined in `tailwind.config.js`; brand colors and component classes (`.card`, `.glass`, `.pill`, etc.) in `style.css`.

## Conventions

- Semantic accent colors, one meaning everywhere: blue = operations/quality/digital, emerald = flow/supply chain, violet = people/leadership, amber = awards/recognition (emerald dot also marks availability status)
- Glass/backdrop-blur only on the sticky header and the hero "At a glance" card — all other cards are flat
- Every animation is gated behind `prefers-reduced-motion`; final values are always in the markup
- Touch targets ≥ 44 px; keyboard focus styles via `:focus-visible` in `style.css`

## Professional contact and CV privacy

The public site uses the dedicated professional address `contact@foschiera.com` and LinkedIn. No contact form or third-party form backend is required. Personal telephone and the original private email are excluded from page markup, structured data, and the public CV.

`src/cv.html` is the public CV source. Keep the complete private CV outside this repository and outside the public web root. Rebuild and visually review both PDF pages when changing CV content. Existing Git history is retained; removing details from the current site does not erase older commits, downloads, or search caches.
