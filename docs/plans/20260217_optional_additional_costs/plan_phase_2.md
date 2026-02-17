# Phase 2 — Calculator Rendering & Enforcement

## Goal
Ensure embedded Revenue and CX calculators obey the `showAdditionalCost` flag by hiding the Additional cost input, forcing ROI math to treat the value as zero, and preventing manual URL tampering, while leaving the main-site calculators unchanged.

## Scope
- `app/embed/[calculator]/page.jsx`: plumb `showAdditionalCost` from `parseEmbedParams` into calculator props.
- `app/components/ROICalculator.jsx` & `app/components/CXCalculator.jsx`: add props/config to control visibility, clamp local state, and update rendering.
- Component/unit tests under `app/components/__tests__/` (new files) using React Testing Library to verify DOM/output behavior.

## Tasks
- [ ] **Propagate toggle through embed page**
  - Update `EmbedCalculatorPage` to read `showAdditionalCost` from `parseEmbedParams` and pass `additionalCostEnabled={parsed.showAdditionalCost}` to calculators.
  - Ensure defaults keep `additionalCostEnabled=true` when rendering outside embed routes.
- [ ] **Calculator prop plumbing**
  - Accept an optional boolean prop (`additionalCostEnabled = true`) in both calculators.
  - When `isEmbed` and the prop is false, ensure local `additionalCost` state initializes and stays at `0`.
  - Add a `useEffect` guard that resets `additionalCost` to zero whenever the prop flips from true→false.
- [ ] **UI rendering changes**
  - Wrap the Additional cost input + labels in a conditional that renders only when `additionalCostEnabled` is true.
  - Confirm no empty containers remain when hidden (for accessibility).
- [ ] **Calculation enforcement**
  - Ensure ROI math always references the clamped state (already uses `additionalCost`), so forcing the state to zero covers calculations.
  - Optionally log a console warning in the calculators if they detect `!additionalCostEnabled && additionalCost !== 0` (should not happen but reinforces debugging).
- [ ] **Tests**
  - Create `app/components/__tests__/ROICalculator.embed.test.jsx` (module scope) covering:
    - Renders Additional cost input when `additionalCostEnabled` true.
    - Input missing when flag false and `isEmbed` true.
    - When flag false, displayed metrics reflect zero additional cost even if `embedOverrides.additionalCost` was non-zero.
  - Mirror similar tests for `CXCalculator`.
- [ ] **Manual QA checklist**
  - Document verification steps for loading `/embed/revenue?...` and `/embed/cx?...` with toggle on/off and with tampered URLs.

## Acceptance Criteria
- Embedded calculators hide the Additional cost UI whenever the toggle is off; the DOM contains no label/input for that field.
- ROI calculations (including charts and derived metrics) reflect zero additional cost in hidden mode.
- Manual edits to `additionalCost` query params do not re-enable the field or change the zeroed value.
- Main-site (non-embed) calculators continue to show and honor the Additional cost input.
- Component tests cover both calculators’ embed rendering states and pass via `npm run test`.

## Tests (Must be implemented in this phase)
- **React Testing Library** (`jest` + `@testing-library/react`):
  - `ROICalculator` embed tests verifying the presence/absence of the Additional cost input and that `annualInvestment` calculations adjust accordingly.
  - `CXCalculator` embed tests with the same checks.
- **Manual**:
  - Use `npm run dev` to open both `/embed/revenue` and `/embed/cx` with `showAdditionalCost` toggled on/off and inspect behavior, including attempts to set `additionalCost` via query params.

## Edge Cases to Address
- Transition from visible→hidden while modal open (preview re-renders) must reset state to zero without stale values.
- Embed pages with stale caches or missing params default to hidden but should not throw runtime errors.
- Accessibility: ensure hiding removes interactive elements entirely; when visible, field remains reachable via keyboard.
- Ensure `additionalCostEnabled` defaults to true so non-embed renders are unaffected even if prop omitted.

## Verification Steps
- `npm run lint`
- `npm run test`
- Manual: launch dev server, use embed modal to toggle Additional cost for both calculators, load resulting iframe URLs, and confirm DOM/content matches expectations (hidden vs. visible, zeroed vs. user-editable).
