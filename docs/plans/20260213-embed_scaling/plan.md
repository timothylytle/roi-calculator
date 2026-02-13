# Plan — Embed Scaling

## Summary
The marketing team needs responsive embeds for the ROI calculators so partners can paste the iframe snippet into HubSpot without rewriting HTML. Today the snippet hard‑codes `width="800" height="600"`, which breaks on narrow layouts and locks the experience to desktop dimensions. This plan adds a sizing toggle and validation to the existing embed modal so marketers can choose between a HubSpot-compliant responsive wrapper or a fixed canvas with explicit dimensions.

Delivery happens in two phases. Phase 1 focuses on UI/state work inside `EmbedModal.jsx`: new sizing controls, preview behaviors, validation helpers, and foundational Jest/RTL tests. Phase 2 layers the final snippet generation, preview markup alignment, documentation updates, and integration tests confirming the generated code matches the spec. Tests run in every phase so regressions are caught early.

## 0. References

### 0.1 Specification (Always Read)
- [spec.md](spec.md) — Detailed specification with acceptance criteria. **Read before any implementation.**

### 0.2 Phase Plans (Read Relevant Phase)
- [plan_phase_1.md](plan_phase_1.md) — Embed modal controls, validation, and initial tests.
- [plan_phase_2.md](plan_phase_2.md) — Snippet generation, preview parity, and integration tests.

### 0.3 Research (Read to Understand Codebase)
- [research.md](research.md) — Codebase exploration, component mapping, existing patterns.

### 0.4 Source Document (Read if Requested)
- [idea.md](idea.md) — Original problem analysis and solution hypothesis. Source from which spec.md was produced.

## 1. Software Design Document (SDD)
### 1.1 Goals & Constraints
- Deliver responsive/static sizing in the embed modal without touching calculator logic or embed routes.
- Remain Next.js App Router friendly; no backend or new runtime services.
- Testing is required per phase; introduces Jest/RTL tooling once.

### 1.2 Proposed Architecture (High-level)
- Enhance `EmbedModal.jsx` to manage sizing state (responsive toggle + static dimensions) alongside existing calculator defaults.
- Introduce `app/lib/embedSizing.js` helper for dimension validation and defaults.
- Preview container becomes mode-aware: responsive wrapper uses CSS aspect ratio tricks; static wrapper sets fixed width/height.
- Snippet generation branches based on mode, emitting either `.hs-responsive-embed` wrapper or explicit dimensions.

### 1.3 Data Model & Types (Signatures, not full code)
- `const [isResponsive, setIsResponsive] = useState(true);`
- `const [staticDimensions, setStaticDimensions] = useState({ width: number, height: number });`
- `validateDimensions(dimensions: { width: number | string, height: number | string }): { numeric: { width: number, height: number }, errors: { width?: string, height?: string }, isValid: boolean }`

### 1.4 Module / File-level Design
- `app/components/embed/EmbedModal.jsx`: main modal UI; holds sizing state, renders sizing controls, preview container, and snippet textarea.
- `app/components/embed/EmbedModalSizing.jsx` (new): encapsulates sizing toggle + inputs; receives props for `isResponsive`, `staticDimensions`, `errors`, and callbacks; scope limited to embed modal.
- `app/lib/embedSizing.js` (new module): exports defaults and validation helpers; used by modal and tests.
- `app/components/embed/EmbedSnippetPreview.jsx` (Phase 2 optional helper): renders responsive/static preview markup for clarity.
- `jest.config.js` + `jest.setup.js`: configure Jest with `next/jest`, register RTL matchers; global scope for repo tests.

### 1.5 Interfaces & Contracts
- `EmbedModalSizing` props:
  - `isResponsive: boolean`
  - `staticDimensions: { width: number | string, height: number | string }`
  - `errors: { width?: string, height?: string }`
  - `onToggleResponsive(next: boolean): void`
  - `onDimensionChange(field: 'width' | 'height', value: string): void`
- `EmbedSnippetPreview` props:
  - `isResponsive: boolean`
  - `staticDimensions: { width: number, height: number }`
  - `theme: 'light' | 'dark'`

### 1.6 Key Algorithms (Pseudo-code)
```
function validateDimensions({ width, height }):
  numericWidth = parseInt(width, 10)
  numericHeight = parseInt(height, 10)
  errors = {}
  if (!Number.isFinite(numericWidth) || numericWidth < 320 || numericWidth > 2000):
    errors.width = 'Width must be between 320 and 2000px'
  if (!Number.isFinite(numericHeight) || numericHeight < 400 || numericHeight > 2000):
    errors.height = 'Height must be between 400 and 2000px'
  return { numeric: { width: clamp(numericWidth), height: clamp(numericHeight) }, errors, isValid: Object.keys(errors).length === 0 }
```

Snippet generation:
```
if (isResponsive):
  snippet = `<div class="hs-responsive-embed">\n  <div class="hs-responsive-embed__wrapper">\n    <iframe src="${embedUrl}" width="100%" height="100%" ...></iframe>\n  </div>\n</div>`
else:
  snippet = `<iframe src="${embedUrl}" width="${width}" height="${height}" ...></iframe>`
```

### 1.7 Testing Architecture
- New Jest environment via `next/jest`; `jest.setup.js` imports `@testing-library/jest-dom`.
- RTL component tests live under `app/components/embed/__tests__/`.
- Pure helper tests live under `app/lib/__tests__/`.
- Fixtures: none; rely on module-level helpers. No custom fixture scopes needed.

### 1.8 Edge Cases
- Empty inputs revert to validation errors; copy disabled.
- Non-numeric text triggers “Must be a number” errors.
- Responsive mode instructions remind users to keep wrapper; static mode ensures width/height not zero.

### 1.9 Observability & Ops
- No telemetry hooks; manual QA steps noted per phase. If analytics later desired, hook into toggle change events.

## 2. Phase Breakdown (Approval checkpoint)
### Phase 1. Embed Modal Controls (status: Approved)
- Goal: Add sizing controls, validation helper, preview adjustments, and foundational tests.
- Acceptance criteria & tests: see [plan_phase_1.md](plan_phase_1.md).

### Phase 2. Snippet & Preview Output (status: Approved)
- Goal: Emit correct responsive/static snippets, align preview markup, update instructions, add snippet-focused tests.
- Acceptance criteria & tests: see [plan_phase_2.md](plan_phase_2.md).

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
- [x] Phase 1: Embed Modal Controls (2026-02-13)
- [x] Phase 2: Snippet & Preview Output (2026-02-13)

### 3.2 Decision Log
- *(Add entries as decisions occur.)*

### 3.3 Surprises & Discoveries
- *(Capture notable findings during implementation.)*

### 3.4 Outcomes & Retrospective
- *(Complete after phases ship.)*
