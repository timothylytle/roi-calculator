# Plan — Embed Scroll Sync

## Summary
HubSpot hosts our calculators inside iframes and already runs `iframeResizer.min.js`, yet the embedded app never loads the matching child script. That leaves HubSpot guessing at a fixed height, causing internal scrollbars on desktop and mobile and hurting conversion. This effort adds the iframe-resizer contentWindow script to `/embed/*`, removes fixed-height wrappers, and documents the CSS/JS contract so marketers get a single smooth scroll surface.

Implementation rolls out in two phases. Phase 1 focuses on wiring up the child script, CSS resets, and any required dependency configuration so embeds can broadcast their height. Phase 2 handles integration QA, documentation, and safeguards (warnings, optional manual resize hook) to ensure HubSpot and future hosts can adopt the change confidently with clear testing instructions.

## 0. References

### 0.1 Specification (Always Read)
- [spec.md](spec.md) — Detailed specification with acceptance criteria. **Read before any implementation.**

### 0.2 Phase Plans (Read Relevant Phase)
- [plan_phase_1.md](plan_phase_1.md) — Phase 1: iframe-resizer wiring + embed CSS reset + initial verification.
- [plan_phase_2.md](plan_phase_2.md) — Phase 2: QA, documentation, fallback messaging, optional hooks.

### 0.3 Research (Read to Understand Codebase)
- [research.md](research.md) — Current Next.js App Router structure, calculator components, existing embed implementation.

### 0.4 Source Document (Read if Requested)
- [idea.md](idea.md) — Original “Option B” brief describing iframe-resizer approach for HubSpot.
- [manual_verification.md](manual_verification.md) — QA checklist for validating scroll sync in HubSpot or local iframe-resizer demos.

## 1. Software Design Document (SDD)
### 1.1 Goals & Constraints
- Deliver iframe auto-resize for `/embed/*` routes by loading the iframe-resizer child script and enforcing CSS that allows natural height. Embedded calculators must continue to respect query-param overrides and existing theming.
- Limit scope to embed routes so the main site bundle is unaffected. Avoid runtime regressions for hosts that do not run iframe-resizer (they keep current behavior).

### 1.2 Proposed Architecture (High-level)
- Introduce a client-only component `IframeResizerChild` under `app/embed/` that imports `iframe-resizer/js/iframeResizer.contentWindow` for its side effects. Add this component to a shared embed layout/wrapper so every embed route loads the script once.
- Update embed CSS (global or layout-scoped) to remove margins, disable horizontal overflow, and ensure top-level containers do not force fixed heights or nested scrolling.
- Optional manual hook `window.parentIFrame?.size()` exposed via a tiny helper for future events (not required for basic functionality).

### 1.3 Data Model & Types (Signatures, not full code)
- `function IframeResizerChild(): JSX.Element | null` (client component, no props).
- CSS module/entry for embed routes specifying `html, body { margin:0; padding:0; overflow-x:hidden; }`.
- Optional helper `triggerParentResize(): void` that guards `window.parentIFrame?.size()`.

### 1.4 Module / File-level Design
- `app/embed/layout.jsx` (or new) — wraps embed routes, injects `<IframeResizerChild />`, ensures `<body>` classes for new CSS.
- `app/embed/IframeResizerChild.jsx` — `'use client'`; import child script; no UI. Scope: module-level side effect.
- `app/globals.css` (or embed-specific stylesheet) — add embed CSS rules under `.embed-root` or `[data-embed]` selectors.
- `app/embed/[calculator]/page.jsx` — ensure wrappers no longer use `min-h-screen` or `overflow:auto`. Possibly replace with `min-h-full` and rely on body background classes.
- `package.json` — add dependency `iframe-resizer` using `npm install iframe-resizer`.

### 1.5 Interfaces & Contracts
- Contract with hosts: parent must load `iframeResizer.min.js` and call `iFrameResize` (documented). Child ensures `IframeResizerChild` runs only on `/embed/*`.
- CSS contract: embed root container must have `width:100%`, `box-sizing:border-box`, no fixed viewport heights. Add data attribute or class to scope styles.

### 1.6 Key Algorithms (Pseudo-code)
```
'use client';
import { useEffect } from 'react';
import 'iframe-resizer/js/iframeResizer.contentWindow';

export default function IframeResizerChild() {
  useEffect(() => {
    if (!window.parentIFrame) {
      console.warn('[embed] parentIFrame not detected; iframe may not resize');
    }
  }, []);
  return null;
}
```

### 1.7 Testing Architecture
- Add integration test checklist: embed route renders without errors, console warns when parentIFrame missing. Automated tests limited to unit snapshot verifying layout includes `IframeResizerChild` (React Testing Library) and that CSS classes removed `min-h-screen` from embed page.
- Manual QA: embed calculators into a test HubSpot page (or local parent using iframe-resizer) to confirm no inner scroll on load and after interactions.

### 1.8 Edge Cases
- CSP blocking child script: log console warning, document requirement for hosts.
- Parent missing iframe-resizer: log warning; embed still works with fallback height.
- Layouts with dynamic height (accordions) not triggering updates: rely on iframe-resizer observer; use optional hook if necessary.
- Manual verification required: follow `manual_verification.md` to ensure embeds resize correctly on host pages.

### 1.9 Observability & Ops (if relevant)
- Console warnings for missing parent script or blocked child script. No additional telemetry.

## 2. Phase Breakdown (Approval checkpoint)
### Phase 1. Wire iframe-resizer child + embed CSS (status: Proposed)
Goal: add the `iframe-resizer` dependency, introduce `IframeResizerChild`, update embed layout/CSS, and verify embed pages render without inner scrollbars locally. Tests: React Testing Library snapshot ensuring child component loads; lint + manual visual smoke tests.
Acceptance criteria: dependency installed, embed layout loads child script, CSS resets applied, automated tests passing, manual verification in local parent page.
Reference: [plan_phase_1.md](plan_phase_1.md)

### Phase 2. QA, documentation, safeguards (status: Proposed)
Goal: exercise embeds in a real HubSpot (or iframe-resizer demo) environment, add documentation/warnings, optional manual resize helper, and update references. Tests: manual QA checklist + unit test for helper (if added).
Acceptance criteria: documented instructions, optional helper invoked safely, HubSpot test page confirms no inner scrollbars, updated references/spec, all tests passing.
Reference: [plan_phase_2.md](plan_phase_2.md)

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
- [x] Phase 1: Wire iframe-resizer child + embed CSS — 2026-02-13T22:26Z
- [x] Phase 2: QA, documentation, safeguards — 2026-02-13T22:40Z

### 3.2 Decision Log
- **Decision:** Add `manual_verification.md` plus `triggerParentResize` helper per Phase 2 scope
  - Date: 2026-02-13
  - Rationale: Provide QA guidance and a safe entry point for future manual resize triggers without forcing immediate adoption.

### 3.3 Surprises & Discoveries
- **Observation:** *(add observations during implementation)*
  - Evidence: ...

### 3.4 Outcomes & Retrospective
(To be filled after completion)
