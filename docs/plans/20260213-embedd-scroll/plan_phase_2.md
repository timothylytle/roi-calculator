# Phase 2 — QA, documentation, safeguards

## Goal
Document the iframe-resizer requirements for hosts, provide an optional helper for future manual resize triggers, and capture QA steps showing the embed no longer scrolls internally when hosted on HubSpot/iframe-resizer demos.

## Scope
- Files: `docs/plans/20260213-embedd-scroll/manual_verification.md` (new), `docs/plans/20260213-embedd-scroll/plan.md` (updates to references/edge cases), optional developer-facing README snippet, `app/embed/parentResize.js` helper + tests.

## Tasks
- [x] Create `docs/plans/20260213-embedd-scroll/manual_verification.md` describing how to embed the iframe in HubSpot (or local iframe-resizer demo), including instructions to confirm no inner scrollbars on desktop/mobile. — 2026-02-13T22:33Z
- [x] Update `docs/plans/20260213-embedd-scroll/plan.md` references/edge cases to point to the new verification doc and host instructions. — 2026-02-13T22:35Z
- [x] Implement `app/embed/parentResize.js` exporting `triggerParentResize()` that safely calls `window.parentIFrame?.size()`, with clear JSDoc usage guidance. Include optional no-op when unavailable. — 2026-02-13T22:37Z
- [x] Add Jest test(s) covering `triggerParentResize()` behavior with and without `parentIFrame`. — 2026-02-13T22:37Z
- [x] Document the helper and usage guidance (e.g., README embed section or inline comments) so future developers know when to call it. — 2026-02-13T22:39Z

## Acceptance Criteria
- Manual verification doc exists with clear steps for QA in HubSpot/local demo.
- Plan references updated so maintainers know to run manual QA.
- Helper function implemented, tested, and discoverable via docs/comments.

## Tests (Must be implemented in this phase)
- `app/embed/__tests__/parentResize.test.js`: ensures helper calls `window.parentIFrame.size()` when present and no-ops otherwise.

## Verification Steps
- `npm run test`
- `npm run lint`
- Follow `manual_verification.md` steps on an iframe-resizer demo or HubSpot page to confirm scrolling behavior.

## Edge Cases to Address
- Hosts lacking iframe-resizer: helper should no-op without throwing.
- Manual QA instructions must mention desktop/mobile validation to catch regressions.
