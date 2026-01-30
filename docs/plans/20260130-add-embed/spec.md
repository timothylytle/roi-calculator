# Embed ROI Calculators — Specification

## 1. Context & Goals (User/Business Perspective)
- Revenue and CX ROI calculators currently live inside `app/components/ROICalculator.jsx` and `app/components/CXCalculator.jsx`, accessible via `app/page.js`. Marketing wants partners to embed either calculator directly on their own sites without building custom forms.
- Primary users: (1) external publishers who need a turnkey widget they can drop into CMS pages, (2) our marketing team, who needs a consistent embed experience to drive lead-gen.
- Success looks like: each calculator offers a clearly labeled “Embed” action that reveals instructions + copyable iframe HTML; iframe renders a standalone calculator experience (per type) with optional configuration for default inputs, theming, and navigation visibility.

## 2. Non-Goals / Out of Scope
- Building multi-tenant APIs or server-rendered data feeds beyond the existing calculators.
- Supporting legacy script-tag embeds or oEmbed discovery endpoints.
- Rewriting calculator logic; ROI math, UI layout, and Recharts visualizations remain unchanged except where necessary for embedding.
- Analytics/lead capture inside embeds (deferred to future work).

## 3. Definitions / Glossary
- **Embed button:** UI control in each calculator that opens the configuration modal.
- **Embed modal:** Overlay that shows preview, configuration toggles, and generated iframe code.
- **Publisher:** Any external party embedding the widget on their site or CMS.
- **Theme controls:** Options to force light/dark styles or align with host branding while preserving legibility.
- **Navigation toggle:** Ability to hide the floating Navigation menu when the calculator is rendered inside an iframe, preventing redundant controls.
- **Default overrides:** Query parameters or config applied to the iframe URL so embedded calculators can start with specific values (price, agent count, etc.).

## 4. Functional Requirements
### 4.1 User stories
- As a marketing manager, I can click “Embed” in either calculator to view embed instructions and copy ready-to-paste iframe HTML.
- As an external publisher, I can tweak default calculator inputs (e.g., agent count, close rate) via UI controls before copying the iframe, so my embed aligns with my audience.
- As a publisher, I can choose light/dark theme and whether to hide the floating navigation menu so the embed matches my site.
- As a site visitor viewing the iframe, I get the full calculator experience (inputs, charts, results) scoped to the selected calculator type.

### 4.2 Use cases (happy path + key variants)
- **UC1 (happy path):** User opens calculator → clicks “Embed” → modal shows preview, theme + navigation toggle, optional default-value form → user copies iframe HTML (includes query params for overrides) → pastes into CMS and gets matching embedded calculator.
- **UC2 (config changes):** User edits several defaults; modal regenerates code snippet + preview updates to reflect chosen values/theme/navigation.
- **UC3 (error):** If defaults are invalid (e.g., negative numbers), modal displays inline validation and keeps the copy button disabled until resolved.

### 4.3 Edge cases & failure modes
- Invalid override values (non-numeric, out of range) must be blocked with clear messages.
- If iframe is loaded with missing/invalid params, fallback to current defaults.
- Embeds must degrade gracefully when iframes are blocked (show message with direct link).
- Ensure keyboard accessibility for modal open/close and copy action.

## 5. Non-Functional Requirements
- Generated iframe must load calculators within ≤2s on broadband.
- Embeds must be responsive down to 320px width; charts must remain readable.
- Respect same security posture as existing pages (no third-party cookies/scripts beyond current stack).
- Provide basic observability by logging embed load + copy events (if feasible within existing infrastructure).

## 6. UX / API Contracts (as applicable)
- Modal includes preview pane, configuration form, copy-to-clipboard button, and success toast.
- Iframe src should accept query params for each input + `theme`, `showNavigation`.
- Error states should use consistent Tailwind styling with clear text.

## 7. Data & State
- Embed modal maintains local state for customizable defaults (same fields as the target calculator), theme selection, and navigation visibility.
- Generated iframe src pattern: `/embed/{calculator}?param=value…`. Calculator components must read query params (client-side) to initialize state.
- No persistent storage; parameters are passed via URL and applied on mount.

## 8. Acceptance Criteria (Top-level)
- Each calculator displays an “Embed” button that opens a modal with preview/config controls.
- Copy button produces a valid iframe snippet referencing a dedicated embed route and reflecting the selected options.
- Embedded calculator loads with the specified defaults, theme, and navigation visibility in at least two major browsers.
- Invalid overrides are prevented with inline validation; copy button remains disabled until inputs are valid.
- Fallback message appears if iframe is blocked.

## 9. Open Questions
- Should embed usage be tracked via analytics events? (defer to marketing/analytics team decision)
- Do we need localization for the modal content? (not clarified)

## 10. Assumptions
- Embeds will only be used on third-party sites that allow iframe content; CSP compatibility rests on the host.
- Marketing prefers iframe snippets over script tags (per decision A).
- Theme + navigation toggles are sufficient personalization for MVP (per choice A).

## 11. References
- Idea source: `docs/plans/20260130-add-embed/idea.md`.
- Existing calculators: `app/components/ROICalculator.jsx`, `app/components/CXCalculator.jsx`, `app/page.js`.
