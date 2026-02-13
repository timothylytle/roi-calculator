# Embed Scroll Sync — Specification

## 1. Context & Goals (User/Business Perspective)
- HubSpot marketers embed our calculators via iframes. The HubSpot page already loads `iframeResizer.min.js` and calls `iFrameResize(...)`, but our Vercel child app never loads the matching `contentWindow` script. HubSpot therefore pins the iframe to a fixed height, producing an internal scrollbar and awkward UX.
- Users: marketing ops managers and partners embedding the calculator on HubSpot. They want the iframe to auto-resize so the page scrolls naturally.
- Goal: enable `/embed/...` routes to report their true height automatically, so desktop and mobile HubSpot pages show a single scrollable surface. Success = iframe height matches calculator content on load and after interactions without manual tweaks.

## 2. Non-Goals / Out of Scope
- No changes to calculator functionality, UI theme, or embed configuration modal.
- Parent-side iframe-resizer setup is out of scope (HubSpot already manages `iFrameResize`).
- No alternative auto-resize approaches besides iframe-resizer; hosts that refuse to run it keep the current fallback.

## 3. Definitions / Glossary
- **iframe-resizer**: JS library synchronizing iframe size between parent/child (https://github.com/davidjbradshaw/iframe-resizer).
- **Child script**: `iframeResizer.contentWindow.js`, loaded inside the embedded page to broadcast size.
- **Embed routes**: Next.js App Router pages under `/embed/[calculator]`.
- **HubSpot parent**: external CMS page hosting the iframe and running `iFrameResize`.

## 4. Functional Requirements
### 4.1 User stories
- As a marketing ops manager, I want auto-resizing embeds so HubSpot pages scroll normally without inner scrollbars.
- As a developer, I can scope iframe-resizer to `/embed/*` routes so the main site remains unaffected.
- As a marketer adjusting calculator inputs (changing height), I expect the iframe to resize within ~250 ms.

### 4.2 Use cases
- **UC1**: HubSpot loads the iframe, child script boots, reports height, and HubSpot adjusts iframe size; page scrolls naturally.
- **UC2**: User triggers UI changes (accordions, validation errors); child script notifies parent and iframe grows accordingly.
- **UC3**: Child script fails due to CSP/network; iframe keeps fallback height and we document that hosts must set a reasonable min-height.

### 4.3 Edge cases & failure modes
- Script blocked: iframe stays fixed—document requirement for hosts to allow the asset.
- Parent not running iframe-resizer: embed behaves as before; highlight requirement in docs.
- Internal wrappers with `height: 100vh` or `overflow: auto` causing nested scroll—spec mandates removing them from embed layout.
- Dynamic content not detected: optionally trigger `window.parentIFrame?.size()` after major layout events.

## 5. Non-Functional Requirements
- **Performance**: child script adds <10 KB gzipped; load only on embed routes.
- **Reliability**: initialize once per embed load; log warnings if initialization fails.
- **Security/privacy**: no extra postMessage listeners beyond iframe-resizer; respect cross-origin restrictions.
- **Observability**: console warnings when iframe-resizer is missing or blocked.
- **Accessibility**: single scroll surface improves keyboard navigation.

## 6. UX / API Contracts
- Embed layout includes an `IframeResizerChild` client component that imports the child script (no UI output).
- CSS for embed pages: `html, body { margin:0; padding:0; overflow-x:hidden; }`; top-level container should not force `100vh` or `overflow:auto`. `.embed-root` spans 100% width with `box-sizing:border-box`.
- Provide optional hook: developers may call `window.parentIFrame?.size()` after significant DOM changes (documented in technical notes).

## 7. Data & State
- No new persistent data. Calculators keep existing query-param overrides and state logic.
- Additional runtime state: iframe-resizer script ensuring height sync; no other storage changes.

## 8. Acceptance Criteria (Top-level)
- HubSpot desktop/mobile embeds show no internal scrollbars; outer page scrolls normally.
- Height adjusts automatically within ~250 ms after UI changes.
- Embed layout contains no fixed-height wrappers causing nested scroll.
- Documentation/instructions inform hosts to keep iframe-resizer parent script and to allow the child asset.
- Manual QA: embed in a HubSpot test page, confirm resize on load and after interactions.

## 9. Open Questions
- Need a runtime banner if parent lacks iframe-resizer? (Current plan: console warning + documentation.)
- Provide fallback messaging when child script blocked? (Deferred to research phase; consider console warnings only.)

## 10. Assumptions
- HubSpot will continue loading `iframeResizer.min.js` and calling `iFrameResize` correctly.
- Our build can import `iframe-resizer/js/iframeResizer.contentWindow` via ESM without CSP issues.
- Hosts will permit the additional script via CSP; otherwise they accept the fallback.

## 11. References
- iframe-resizer GitHub — https://github.com/davidjbradshaw/iframe-resizer
- Requirement brief — `docs/plans/20260213-embedd-scroll/idea.md`
