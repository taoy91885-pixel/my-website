# Project instructions

## Product goal

Maintain Tao Yu's Chinese personal website as an MVP that can grow into a professional portfolio and knowledge product. Prefer small, visible, testable improvements over speculative platform work.

## Current architecture

- Static HTML, CSS, and JavaScript with no build step.
- `index.html` is the public homepage.
- `ai.html` is a published customer-facing route and must remain available.
- `cash-flow-forecast.html` is the intended cash-flow forecasting scenario route and must remain stable once published.
- Finance landscape content lives in `assets/data/finance-data.js`.
- Page behavior lives in `assets/js/finance-landscape.js`.
- Page styles live under `assets/css/`.
- Cash-flow forecasting behavior lives in `assets/js/cash-flow-forecast.js`.

## Change rules

- Preserve UTF-8 Chinese content and relative URLs.
- Keep content data separate from rendering logic and styles.
- Reuse existing design tokens before adding new colors or spacing values.
- Do not introduce a framework, package manager, backend, authentication, or database unless the requested feature needs it and the user agrees.
- Treat files excluded through `.git/info/exclude` as the user's local reference material; do not move, edit, or commit them unless explicitly requested.
- Do not commit, push, open a pull request, change Vercel settings, or deploy unless the user explicitly asks.

## Validation

- Run syntax checks for JavaScript files after changes.
- Check that every local stylesheet, script, image, and page link resolves.
- For layout or interaction changes, preview through a local web server and test the relevant viewport and interaction.
- Confirm `index.html` and `ai.html` still load before handing off.
