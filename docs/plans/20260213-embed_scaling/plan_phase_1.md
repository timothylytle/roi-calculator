# Phase 1 — Embed Modal Controls

## Goal
Introduce responsive/static sizing controls in `EmbedModal.jsx`, including state, validation, and preview behaviors, plus foundational Jest/RTL tests for the sizing logic.

## Scope
- Files: `app/components/embed/EmbedModal.jsx`, `app/components/embed/EmbedModalSizing.jsx` (new helper component, file-scoped), `app/lib/embedSizing.js` (new module-level helper), `app/globals.css` (responsive preview styles), configuration files for Jest (`jest.config.js`, `jest.setup.js`, `package.json` test script if missing).
- No changes to `buildEmbedUrl` or embed routes; snippet string still single iframe until Phase 2.

## Tasks
- [x] **Add sizing state + defaults.** In `EmbedModal.jsx`, introduce `const [isResponsive, setIsResponsive] = useState(true);` and `const [staticDimensions, setStaticDimensions] = useState({ width: 800, height: previewHeight + 200 });`. Ensure toggling responsive mode does not reset calculator overrides.
- [x] **Create sizing UI component.** Extract a small component (same file or new `EmbedModalSizing.jsx`) that renders: responsive toggle button, helper copy referencing HubSpot `.hs-responsive-embed`, and two `<input type="number">` fields for width/height when static mode is active. Inputs bind to `staticDimensions` state and display inline errors.
- [x] **Implement validation helper.** Add `app/lib/embedSizing.js` exporting `DEFAULT_STATIC_DIMENSIONS`, `validateDimensions({ width, height })`, and `coerceDimensions`. Enforce integers, min width 320, min height 400, max 2000. Helper returns `{ numeric, errors, isValid }` similar to form validation to reuse in modal.
- [x] **Update preview container.** Modify preview pane in `EmbedModal.jsx` to branch: responsive wrapper uses Tailwind classes `relative w-full` + inline `paddingBottom` to mimic aspect ratio; static wrapper sets explicit `style={{ width, height }}` and allows overflow scroll. Document classes in code comments.
- [x] **Copy button gating + instructions.** Ensure `isValid` flag now combines calculator form validity and dimension validity; disable copy button if either invalid. Add short paragraph near textarea reminding users to keep the responsive wrapper enabled when toggle is on.
- [x] **Install Jest/RTL tooling.** Add devDependencies via `npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event next/jest`. Add `jest.config.js` using `next/jest`, plus `jest.setup.js` importing `@testing-library/jest-dom`. Update `package.json` scripts with `"test": "jest"`. Document new tooling in plan if tech-stack file appears.
- [x] **Write tests.** Create `app/components/embed/__tests__/EmbedModalSizing.test.jsx` covering: (1) validation helper rejects invalid dimensions, (2) toggle default = responsive, (3) enabling static reveals inputs and errors on invalid values, (4) `aria-pressed` or class state matches toggle. Use RTL render with basic props (mock `buildEmbedUrl`).

## Acceptance Criteria
- Embed modal shows sizing section with responsive toggle default ON; switching to static reveals width/height inputs with min/max validation.
- Preview region reflects current sizing mode (fluid wrapper vs explicit dimensions) without affecting calculator controls.
- Copy button disabled whenever static dimensions invalid; helper text explains wrapper requirement for responsive mode.
- Jest/RTL tooling configured and tests cover sizing helper + component state transitions.

## Tests (Must be implemented in this phase)
- `app/lib/__tests__/embedSizing.test.js`: unit tests for `validateDimensions` boundaries (min, max, non-numeric, blanks defaulting to errors).
- `app/components/embed/__tests__/EmbedModalSizing.test.jsx`: RTL tests verifying toggle default, error rendering, preview wrapper class changes, and copy button disablement when invalid.

## Verification Steps
- `npm run lint`
- `npm run test`
- Manual spot check: run `npm run dev`, open embed modal, toggle responsive/static, ensure preview updates and copy button enables/disables appropriately.
