# Plan — Optional Additional Cost Toggle

## Summary
Marketing partners embedding the Revenue or CX ROI calculators often want to hide the “Additional cost” input so visitors focus on the core ROI levers. Today the embed modal always includes that field and the iframe honors any `additionalCost` override, forcing partners to edit snippets manually if they want the field gone. This effort introduces a first-class toggle in the embed configuration so marketers can control the field’s visibility per embed without code edits, while keeping the main-site calculators untouched.

Deliverables include extending the embed configuration library to serialize a `showAdditionalCost` flag, teaching the embed modal to expose a default-off checkbox, updating calculators to respect that flag only in embed contexts, and adding targeted tests that cover query parsing plus rendering behaviors. Work is organized into two phases: Phase 1 implements the modal/UI plumbing and URL contracts, and Phase 2 enforces the flag within the calculators themselves. Each phase has its own acceptance criteria and test plan, enabling iterative delivery.

## 0. References

### 0.1 Specification (Always Read)
- [spec.md](spec.md) — Detailed specification with acceptance criteria. **Read before any implementation.**

### 0.2 Phase Plans (Read Relevant Phase)
- [plan_phase_1.md](plan_phase_1.md) — Phase 1: Embed configuration toggle & URL plumbing.
- [plan_phase_2.md](plan_phase_2.md) — Phase 2: Calculator rendering & enforcement.

### 0.3 Research (Read to Understand Codebase)
- [../../research.md](../../research.md) — Codebase exploration, component mapping, existing patterns.

### 0.4 Source Document (Read if Requested)
- [idea.md](idea.md) — Original problem analysis and solution hypothesis.

## 1. Software Design Document (SDD)
### 1.1 Goals & Constraints
- Provide a per-embed toggle, default OFF, that hides Additional cost in the iframe and forces ROI math to treat additional cost as zero (spec §4).
- Preserve current behavior for main-site calculators; the new logic applies only within embeds (spec §2).
- Avoid new dependencies or stack changes. Follow existing lint/test commands (`npm run lint`, `npm run test`).
- Maintain accessibility by removing hidden controls from the DOM and ensuring toggle is keyboard operable.

### 1.2 Proposed Architecture (High-level)
- Extend `app/lib/embed.js` to own the `showAdditionalCost` state alongside numeric defaults. `buildEmbedUrl` appends `showAdditionalCost=true` only when marketers opt in; `parseEmbedParams` normalizes booleans, injects zero for hidden scenarios, and emits warnings on conflicts.
- Embed modal retains a single source of truth for all customizable values (`formValues`). Adding `showAdditionalCost` to that object ensures previews/snippets stay in sync without extra prop drilling.
- Embed calculators already receive overrides via `embedOverrides`. Introduce an `additionalCostEnabled` prop (derived inside `/embed/[calculator]/page.jsx`) so the calculators can conditionally render the input and clamp state to zero. Non-embed renders omit this prop and keep full functionality.

### 1.3 Data Model & Types (Signatures, not full code)
- `calculatorConfigs[calculatorType]`: extend with metadata describing whether Additional cost is togglable (boolean) and default flag value.
- `buildEmbedUrl(calculatorType: 'revenue' | 'cx', values: Record<string, number>, theme: 'light' | 'dark', showNavigation: boolean, options?: { showAdditionalCost?: boolean }) => string`
- `parseEmbedParams(searchParams: string | URLSearchParams, calculatorType: string) => { overrides: Record<string, number>, theme: 'light' | 'dark', showNavigation: boolean, showAdditionalCost: boolean, warnings: string[] }`
- `ROICalculatorProps = { embedOverrides?, embedTheme?, isEmbed?, additionalCostEnabled?: boolean }` (same for CX).

### 1.4 Module / File-level Design
- `app/lib/embed.js`: store the toggle default, append new query param, ensure overrides reset `additionalCost` to zero when hidden, surface warnings for conflicting inputs.
- `app/components/embed/EmbedModal.jsx`: add checkbox UI tied to `formValues.showAdditionalCost`, validation, preview, and copy logic.
- `app/embed/[calculator]/page.jsx`: extract `showAdditionalCost` from `parseEmbedParams` return value and pass `additionalCostEnabled` + sanitized overrides to calculators.
- `app/components/ROICalculator.jsx` & `app/components/CXCalculator.jsx`: conditionally render Additional cost control; when disabled, force local state to zero and skip DOM output.
- Tests: add/extend `app/lib/__tests__/embed.test.js` (or similar) plus lightweight component tests if feasible.

### 1.5 Interfaces & Contracts
- Checkbox label: “Show Additional cost input in embed” (exact copy may change but must clearly indicate scope). Default unchecked.
- URL contract: absence or `showAdditionalCost=false` hides the field; only `showAdditionalCost=true` enables it. Any `additionalCost` query param is ignored when flag is false.
- Calculator prop contract: when `isEmbed` and `additionalCostEnabled===false`, components must hide UI, clamp state, and ensure ROI math uses zero.

### 1.6 Key Algorithms (Pseudo-code)
```
function buildEmbedUrl(type, values, theme, showNav, showAdditionalCost=false):
  params = serialize(values)
  if theme === 'dark': params.set('theme','dark')
  if showNav: params.set('showNavigation','true')
  if showAdditionalCost: params.set('showAdditionalCost','true')
  return `${origin}/embed/${type}?${params}`

function parseEmbedParams(query, type):
  params = toURLSearchParams(query)
  showAdditionalCost = normalizeBoolean(params.get('showAdditionalCost'))
  for field in config.fieldOrder:
    overrides[field] = sanitizeNumber(...)
  if !showAdditionalCost:
    if overrides.additionalCost !== 0:
      warnings.push('Additional cost overridden because field hidden')
    overrides.additionalCost = 0
  return { overrides, showAdditionalCost, theme, showNavigation, warnings }
```

### 1.7 Testing Architecture
- **Embed library unit tests (Jest)**: new cases for boolean parsing, zero clamping, warning emission, and serialization via `buildEmbedUrl`.
- **Component/unit tests**: optionally use React Testing Library to mount calculators with `isEmbed` + `additionalCostEnabled=false` to ensure the field is absent and ROI calculations receive zero.
- **Manual QA**: run `npm run dev`, toggle checkbox in modal, verify preview/snippet, and load iframes with toggles on/off plus tampered query strings.

### 1.8 Edge Cases
- Legacy snippets lacking `showAdditionalCost` default to hidden but keep functioning.
- Malformed booleans (`showAdditionalCost=foo`) treated as false.
- Direct URL tampering (adding `additionalCost`) cannot re-enable the control when flag is false.
- Accessibility: ensure hidden elements are truly removed, not visually hidden.

### 1.9 Observability & Ops (if relevant)
- Console warnings generated in `parseEmbedParams` when conflicting overrides occur help diagnose embed misconfiguration. No additional telemetry needed.

## 2. Phase Breakdown (Approval checkpoint)

### Phase 1. Embed Config & URL Plumbing (planned)
- **Goal**: Add the `showAdditionalCost` toggle to the embed modal and thread the flag through embed URL generation/parsing.
- **Acceptance criteria**: Toggle defaults to OFF, preview/snippet respect state, `buildEmbedUrl` serializes the flag, `parseEmbedParams` clamps additional cost when hidden, and console warnings note conflicts.
- **Tests**: Jest cases for `buildEmbedUrl`/`parseEmbedParams`, plus manual modal QA. Done when tests + lint pass.
- **Plan doc**: [plan_phase_1.md](plan_phase_1.md)

### Phase 2. Calculator Rendering & Enforcement (planned)
- **Goal**: Ensure calculators hide the Additional cost field and force zero when the embed flag is false, without impacting main-site renders.
- **Acceptance criteria**: Embed calculators reflect toggle state, ROI math ignores additional cost when hidden, manual tampering cannot re-enable it, and primary site behavior unchanged.
- **Tests**: Component-level tests (if feasible) verifying DOM removal + zeroed calculations, plus manual embed QA for both calculators. Done when tests + lint pass.
- **Plan doc**: [plan_phase_2.md](plan_phase_2.md)

## 3. Living Sections (Mandatory)

> **Instructions for maintainers:**
>
> This plan is a living document. As you make key design decisions, update the plan to record both the decision and the thinking behind it. Record all decisions in the `Decision Log` section.
>
> Maintain the `Progress` section in this plan and in the corresponding phase document. Mark tasks as `[ ]` not started, `[~]` in progress, or `[x]` done.
>
> When you discover optimizer behavior, performance tradeoffs, unexpected bugs, or inverse/unapply semantics that shaped your approach, capture those observations in the `Surprises & Discoveries` section with short evidence snippets (test output is ideal).
>
> If you change course mid-implementation, document why in the `Decision Log` and reflect the implications in `Progress`. Plans are guides for the next contributor as much as checklists for you.
>
> At completion of a major task or the full plan, write an `Outcomes & Retrospective` entry summarizing what was achieved, what remains, and lessons learned.
>
> **This document must describe not just the what but the why for almost everything.**

### 3.1 Progress
- [x] Phase 1: Embed Config & URL Plumbing
- [x] Phase 2: Calculator Rendering & Enforcement

### 3.2 Decision Log
- **Decision:** _(record here)_
  - Date: YYYY-MM-DD
  - Rationale: ...

### 3.3 Surprises & Discoveries
- **Observation:** _(record here)_
  - Evidence: ...

### 3.4 Outcomes & Retrospective
(To be filled after completion)
