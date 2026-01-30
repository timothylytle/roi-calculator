## Source Documents (Required Reading)
The implementer MUST read these before starting:
- `docs/plans/20260130-add-embed/spec.md` – Full feature requirements, UX expectations, and acceptance criteria for the embed capability.
- `app/components/ROICalculator.jsx`, `app/components/CXCalculator.jsx`, `app/page.js` – Current calculator implementations and navigation integration referenced by the spec.

## Purpose / Big Picture
This plan enables marketers and external publishers to embed either ROI calculator on third-party sites via a copy-paste iframe. Today, calculators only live on our page, so partners cannot reuse them without engineering help. After following this plan, each calculator displays an “Embed” button that launches a configuration modal where marketers preview the widget, choose theme/navigation visibility, set default input overrides, and copy the generated iframe HTML. The iframe loads a dedicated embed route that renders the selected calculator with query-parameter defaults applied, honors the theme/navigation choices, and falls back safely when parameters are missing or invalid. Delivering this unlocks turnkey distribution: publishers drop the snippet into any CMS and instantly provide an interactive ROI calculator tailored to their audience, while we maintain a single codebase.

## Context & Orientation
The app uses Next.js App Router with client components. Both calculators fully manage their state via `useState` + `useEffect`. Navigation is a floating client component that switches between calculators. No embed routes or modals exist, so the plan must introduce: (1) shared utilities for parsing/serializing calculator state into query parameters, (2) reusable modal UI with form validation, preview surface, and copy-to-clipboard behavior, (3) new routes under `app/embed/[calculator]/page.jsx` rendering the calculators without the navigation chrome, honoring overrides, and showing a fallback link if iframes are blocked.

## Plan of Work
### Milestone 1 – Embed Modal UX
1. Add an `EmbedModal` client component under `app/components/embed/EmbedModal.jsx`. It should accept props describing the calculator type (`'revenue'|'cx'`), current default inputs, and callbacks for closing + copying. Inside the modal, implement:
   - Form controls mirroring the calculator inputs (price per agent, agents/customers, etc.), plus theme selector (light/dark) and navigation toggle.
   - Live validation (non-negative numbers, ranges matching sliders). Disable the copy button until all fields pass.
   - Preview pane that renders the actual calculator component in an iframe-like container by reusing the calculator component with overrides applied (no cross-window messaging yet).
   - Copy button that assembles the iframe HTML string with the generated embed URL. Use the Clipboard API and show a toast/inline confirmation.
2. Add state + handlers in each calculator component to show/hide the modal, passing current input state into it. Place an “Embed” button near the header.

### Milestone 2 – Embed Routes and Overrides
1. Create new App Router segment `app/embed/[calculator]/page.jsx`. This page should:
   - Inspect route params to choose which calculator to render; for invalid IDs show a 404-style message.
   - Parse query/search params for defaults (use shared helper functions) and initialize calculator state without showing navigation.
   - Read theme + navigation flags (`theme=light|dark`, `showNavigation=true|false`). Apply a CSS class or context so the calculator renders in the requested theme and optionally hides the floating menu.
   - When query params are missing or invalid, fall back to existing default values. If params violate constraints, ignore just that param and record the issue in console/log for observability.
   - Provide a fallback `<noscript>`-style message instructing users to open the full site if iframes are blocked.
2. Update calculators so they can operate in “embed mode” (e.g., hide page-level padding, suppress internal navigation) based on a prop, enabling the embed route to reuse the same component.

## Concrete Step-by-Step Instructions
### Milestone 1 – Embed Modal UX
1. In `app/components/embed/EmbedModal.jsx` (new file):
   - Import React hooks, modal container, copy icon, and the specific calculator component for preview.
   - Define props: `{ calculatorType: 'revenue' | 'cx', initialValues: CalculatorInputs, onClose: () => void }`. Maintain local state for each form input plus `theme` (`'light'|'dark'`) and `showNavigation` (boolean).
   - Implement `validateInputs(values)` returning `{ isValid, errors }`. Enforce existing slider ranges: close rate 1–40, churn 1–60, etc.
   - Add controlled inputs mirroring the calculator fields; use number inputs with min/max and descriptive helper text.
   - Display a preview container rendering the calculator component directly via JSX (`<ROICalculator embedOverrides={formValues} embedTheme={theme} hideNavigation={!showNavigation} />`).
   - Construct an embed URL via helper `buildEmbedUrl(calculatorType, formValues, theme, showNavigation)` that serializes values to query params. Compose iframe HTML string:
     ```html
     <iframe src="https://<host>/embed/revenue?pricePerAgent=..." width="100%" height="800" style="border:0" loading="lazy"></iframe>
     ```
   - Copy action: call `navigator.clipboard.writeText(snippet)`, catch errors, and show inline status.
2. Inside each calculator component:
   - Add `const [isEmbedOpen, setEmbedOpen] = useState(false);`.
   - Render a button styled consistently with existing header controls (right-aligned). On click, set `true`.
   - Conditionally render `<EmbedModal calculatorType="revenue" initialValues={{ pricePerAgent, ... }} onClose={() => setEmbedOpen(false)} />`.
   - Ensure modal uses a portal (`createPortal`) or is positioned absolutely so it overlays the page.

### Milestone 2 – Embed Routes and Overrides
1. Create `app/embed/[calculator]/page.jsx`:
   - Use Next.js `useSearchParams` and route params to determine which calculator to render.
   - Implement helper `parseEmbedParams(searchParams, calculatorType)` returning sanitized values with defaults. Reject invalid numbers by falling back silently (log to console).
   - Render:
     ```jsx
     return (
       <html className={themeClass}>
         <body className="bg-slate-100">
           <CalculatorComponent embedOverrides={overrides} hideNavigation={hideNav} />
           {iframeBlockedMessage()}
         </body>
       </html>
     );
     ```
   - Use `<noscript>` or `<div>Enable iframes...</div>` fallback visible when `window === undefined` or via CSS to show when the iframe fails.
2. Update calculators:
   - Accept optional props `embedOverrides`, `embedTheme`, `hideNavigation` (default false).
   - When provided, initialize state from `embedOverrides` instead of defaults. Update `useEffect` to recalc results whenever overrides change.
   - Wrap root container with a class that adapts to `embedTheme` (light/dark) by toggling background/text classes.
   - Conditionally render `<Navigation />` only when `hideNavigation` is false.
3. Add utilities in `app/lib/embed.js` for serializing/deserializing params.

## Validation, Acceptance, Idempotence
1. **Local verification for modal**
   - Run `npm run dev`.
   - Open `http://localhost:3000`.
   - For each calculator, click “Embed”. Confirm modal opens, validates inputs (e.g., negative value → error, copy disabled). Adjust defaults, theme, navigation toggle; ensure preview updates. Press “Copy” and confirm iframe HTML includes chosen params.
2. **Embed route verification**
   - Paste the snippet into a simple HTML sandbox (e.g., temporary file) and open it; iframe should show the calculator without navigation (if hidden) and honoring theme.
   - Test parameter fallbacks by visiting `/embed/revenue?pricePerAgent=foo`; verify defaults apply where invalid.
   - Disable iframes or open the embed URL directly to see fallback messaging.
3. **Cross-browser sanity**
   - Verify in at least Chrome and Firefox/Safari that modal, clipboard, and iframe behavior match expectations.
4. **Idempotence**
   - Repeat the steps after restarting dev server; behavior should remain consistent and re-runnable without side effects.

## Interfaces and Dependencies
- `EmbedModal` component props: `{ calculatorType, initialValues, onClose }`.
- Calculator props:
  ```jsx
  <ROICalculator embedOverrides?={...} embedTheme?="light"|"dark" hideNavigation?={bool} />
  ```
- Helper module `app/lib/embed.js` exposing:
  - `buildEmbedUrl(type, values, theme, showNav) -> string`
  - `parseEmbedParams(searchParams, type) -> { overrides, theme, showNavigation }`
  - `sanitizeNumber(value, { min, max, default })`

## Progress Tracking & Decision Log
- **Progress Status:** Milestone 1 complete (2026-01-30). Milestone 2 (embed routes + overrides) not started.
- **Progress Log:**
  - 2026-01-30: Added shared `app/lib/embed.js`, created `EmbedModal` with live preview, helper form validation, and copy-to-clipboard, plus integrated modal buttons into both calculators. Calculators now honor embed props and theme wrappers. Lint suite (`npm run lint`) passes.
- **Decision Log:**
  1. Embed snippet will be iframe-based (marketing requirement) for simplicity.
  2. Theme + navigation toggles are expressed via query params so embed routes can render deterministically.
  3. Calculators themselves handle embed overrides, ensuring preview + live calculator share logic.
  4. Calculator embed props were added during Milestone 1 to enable the live preview inside the modal; embed routes will reuse the same props later.
  5. React 19 lint warnings against `setState` in effects led to deriving calculator results via `useMemo` and remounting embed previews with keys when overrides change.

## Surprises / Risks
- Clipboard API may fail on insecure origins; modal should show fallback instructions (manual select/copy).
- Host CSP could block iframes; embed route includes fallback link to the canonical calculator page.
