# Form Builder Pro

Form Builder Pro is a production-ready, schema-driven form builder built with Vite + React + Tailwind CSS v4.

## Features

- Field palette with click-to-add and drag-to-add for: Text, Email, Number, Textarea, Select, Checkbox, Date.
- Drag-and-drop field reordering in canvas.
- Keyboard/mobile reorder fallback via Move Up / Move Down controls.
- Field settings editor for labels, placeholders, help text, required, default value, and validation rules.
- Select option management with add/remove/reorder.
- Preview mode that renders from schema and validates on blur and on submit.
- Submission success state with pretty-printed JSON.
- Schema import/export with:
  - Paste JSON import with friendly validation errors.
  - Copy JSON to clipboard.
  - Download `.json` file.
- Versioned persistence in `localStorage` (`form_builder_pro_v1`) with first-run demo seed.
- Theme toggle (light/dark), persisted in `localStorage`, implemented via `document.documentElement.classList`.
- About modal and required author signature/footer.
- Toast notifications for save/import/export/reset.
- Loading skeleton during schema import apply.
- Empty state UI for blank canvas.
- Reduced-motion support via `prefers-reduced-motion`.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. Build production bundle:

```bash
npm run build
```

4. Preview production build locally:

```bash
npm run preview
```

## GitHub Pages Notes

- This app is fully static and compatible with GitHub Pages.
- No server/API routes, SSR, or Node-only runtime APIs are used.
- Vite `base` is configured in `vite.config.js`; deployment under repository subpaths is supported.
- Router is not used in this project (single-page view switch), so no `HashRouter` setup is required.
- Assets are not referenced with hardcoded root paths (no `/asset.png` usage).

## QA Checklist

- [ ] App works at 360px width with no horizontal scrolling.
- [ ] Mobile layout supports collapsible palette/settings drawers.
- [ ] Desktop layout renders 3-panel builder workspace.
- [ ] Focus rings are visible on interactive controls.
- [ ] Modal dialogs support focus trap, ESC close, and focus return.
- [ ] No console errors during normal flows.
- [ ] Import invalid JSON shows friendly errors and does not crash.
- [ ] Export copy/download works.
- [ ] Preview validates on blur and submit.
- [ ] `npm run build` completes successfully.

Author
HesamCode
Portfolio: https://hesamcode.github.io
