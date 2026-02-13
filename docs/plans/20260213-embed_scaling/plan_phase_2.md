# Phase 2 — Snippet & Preview Output

## Goal
Implement conditional iframe snippet generation and preview output for responsive vs static embeds, update instructions, and expand the test suite to cover snippet strings and clipboard gating.

## Scope
- Files: `app/components/embed/EmbedModal.jsx`, new helper `app/components/embed/EmbedSnippetPreview.jsx` (optional), `app/lib/embedSizing.js` (reused/expanded), documentation copy inside modal.
- No changes to calculator components or embed routes; focus is modal snippet/preview behavior and tests.

## Tasks
- [x] **Conditional snippet logic.** Update `iframeSnippet` computation in `EmbedModal.jsx` to branch:
  - Responsive: wrap iframe in template string using HubSpot wrapper markup (`<div class="hs-responsive-embed"><div class="hs-responsive-embed__wrapper">...</div></div>`), set `width="100%" height="100%"` in iframe.
  - Static: retain single iframe with `width`/`height` from validated `staticDimensions`.
  - Ensure snippet string includes newline/indentation for readability.
- [x] **Preview output alignment.** Create helper component (or inline logic) that renders the same markup structure as snippet (without actual iframe) so users see how the wrapper behaves. Responsive preview should show wrapper classes; static preview should mimic fixed canvas. Add accessible labels describing “Responsive preview” vs “Static preview”.
- [x] **Instructions + warnings.** Update textarea helper text to emphasize: “Keep the `.hs-responsive-embed` wrapper when responsive mode is on.” Mention HubSpot KB link again.
- [x] **Clipboard handling.** Ensure copy button copies the full snippet string for responsive mode (including wrapper). Confirm disabled state respects both form and sizing validity.
- [x] **Tests for snippet output.** Extend Jest/RTL tests (`app/components/embed/__tests__/EmbedModalSnippet.test.jsx`, or extend prior test file) to assert snippet text matches expected wrapper when toggling. Mock clipboard API to confirm copy writes responsive string. Cover static mode string as well.
- [x] **Documentation update.** If README or instructions mention embed snippet in text, update to highlight new responsive option (e.g., `docs/plans/...` plan references or marketing notes). Ensure plan references remain accurate.

## Acceptance Criteria
- Copy/paste snippet matches spec for both responsive (wrapper + 100% width/height) and static (custom dimensions).
- Preview visually mirrors snippet structure and provides accessible descriptions.
- Instructions clearly state wrapper requirement; no confusion about when to use static mode.
- Expanded Jest/RTL tests verify snippet strings and copy button interactions.

## Tests (Must be implemented in this phase)
- `app/components/embed/__tests__/EmbedModalSnippet.test.jsx`: tests snippet string output for responsive/static modes, ensures copy button writes expected text.
- Update existing sizing tests if necessary to cover new preview component.

## Verification Steps
- `npm run lint`
- `npm run test`
- Manual verification: run app, open modal, inspect textarea contents under both modes, paste snippet into external HTML sandbox to confirm responsive wrapper works, static respects dimensions.
