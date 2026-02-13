# Phase 1 — Wire iframe-resizer child + embed CSS

## Goal
Introduce the iframe-resizer child script on `/embed/*`, add required CSS/layout adjustments, and prove the embed renders without internal scrollbars locally.

## Scope
- Files: `package.json`, `package-lock.json`, `app/embed/IframeResizerChild.jsx`, `app/embed/layout.jsx` (or equivalent), `app/embed/[calculator]/page.jsx`, `app/globals.css` (embed-specific section), `app/embed/__tests__/` (RTL tests verifying child inclusion).
- Dependency: `npm install iframe-resizer`.

## Tasks
- [x] Install iframe-resizer dependency (`npm install iframe-resizer`). Update `package.json`/lockfile. — 2026-02-13T22:16Z
- [x] Implement `app/embed/IframeResizerChild.jsx` (`'use client'`; imports `iframe-resizer/js/iframeResizer.contentWindow`; logs warning if `window.parentIFrame` missing). Scope: module-level side effect. — 2026-02-13T22:23Z
- [x] Update embed layout (`app/embed/layout.jsx` or new) to wrap children with `<IframeResizerChild />` and a container applying embed-specific classes (e.g., `<body className="embed-body">`). — 2026-02-13T22:23Z
- [x] Adjust embed CSS (in `app/globals.css` or dedicated file) to include:
  - `html.embed-body, body.embed-body { margin:0; padding:0; overflow-x:hidden; }`
  - `.embed-root { width:100%; box-sizing:border-box; }`
  - Remove `min-h-screen`/`overflow-auto` on embed wrappers.
- [x] Update `app/embed/[calculator]/page.jsx` to remove fixed heights and ensure root element uses `.embed-root` class. — 2026-02-13T22:24Z
- [x] Add RTL test verifying embed layout renders `<IframeResizerChild />` (mock component detection) and that console warning triggers when `window.parentIFrame` undefined. — 2026-02-13T22:25Z

## Acceptance Criteria
- iframe-resizer dependency installed.
- Embed layout loads `IframeResizerChild` on every `/embed/*` view.
- CSS ensures no default margins/overflow-x and no `min-h-screen` wrappers.
- RTL tests covering child component and warning path pass; manual local preview shows no inner scrollbars (to be validated by developer).

## Tests (Must be implemented in this phase)
- `app/embed/__tests__/EmbedLayout.test.jsx`: ensures layout renders child component and root class.
- Optional test verifying warning when `window.parentIFrame` missing (mock console.warn).

## Verification Steps
- `npm run lint`
- `npm run test`
- Manual: run `npm run dev`, open `/embed/revenue` to confirm no inner scrollbar.

## Edge Cases to Address
- CSP blocking `iframeResizer.contentWindow` import; surface console warning and document requirement.
- Hosts not running iframe-resizer parent script should experience current behavior without crashes.
