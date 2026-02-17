# Phase 1 — Embed Config & URL Plumbing

## Goal
Introduce a marketer-facing toggle inside the embed modal that controls whether the Additional cost field appears in embeds, and ensure the flag is serialized/deserialized through the existing embed URL helpers.

## Scope
- `app/lib/embed.js`: calculator metadata, `buildEmbedUrl`, `parseEmbedParams`, and associated helpers/tests.
- `app/components/embed/EmbedModal.jsx`: modal state, form controls, preview integration, and copy/snippet generation.
- (Optional) `app/lib/__tests__/embed.test.js` or new sibling test file to cover serialization/parsing behavior.

## Tasks
- [ ] **Extend embed configuration metadata**
  - Update `calculatorConfigs` in `app/lib/embed.js` to declare a `showAdditionalCostDefault` flag (default `false`).
  - Document in code comments why toggling is scoped to Additional cost only.
- [ ] **Update `buildEmbedUrl`**
  - Accept an options argument (or extend existing signature) that includes `showAdditionalCost`.
  - Serialize `showAdditionalCost=true` only when marketers opt in; omit the param to represent the default OFF state.
- [ ] **Update `parseEmbedParams`**
  - Normalize the `showAdditionalCost` boolean from query params (accept `true/1` for opt-in).
  - Clamp `overrides.additionalCost` to zero whenever `showAdditionalCost` is false or missing, and push a warning if a non-zero value was provided.
  - Return the normalized flag so later phases can pass it down to calculators.
- [ ] **Embed modal UI**
  - Add a checkbox (copy TBD, e.g., “Show Additional cost input in embed”) to `EmbedModal.jsx`, default unchecked.
  - Store the value in `formValues` so preview components receive it through existing props.
  - Display helper text if necessary (optional) but ensure no additional banners are introduced.
- [ ] **Snippet & preview wiring**
  - Ensure `numericValues` / overrides incorporate the toggle when constructing preview calculator props.
  - Update the iframe snippet generation to include the new parameter when applicable.
- [ ] **Unit tests**
  - Add/extend Jest tests verifying `buildEmbedUrl` serialization and `parseEmbedParams` clamping/warnings for combinations of inputs.
- [ ] **Manual QA notes**
  - Document steps to exercise the modal (toggle on/off, copy snippet, inspect URL) for later verification.

## Acceptance Criteria
- Embed modal displays a default-off checkbox controlling the presence of the Additional cost field in previews.
- Generated iframe URLs include `showAdditionalCost=true` only when marketers opt in.
- `parseEmbedParams` exposes `showAdditionalCost` in its return object, defaults to false when param absent, and forces `additionalCost` to zero while logging conflicts.
- Jest tests cover serialization/parsing cases, and lint/tests pass.

## Tests (Must be implemented in this phase)
- **Unit**: Jest cases for `buildEmbedUrl` and `parseEmbedParams` covering
  - default behavior (param omitted, clamped to zero),
  - opt-in true (param present, override respected),
  - conflicting overrides (non-zero additionalCost while flag false emits warning and resets to zero),
  - malformed boolean strings defaulting to false.
- **Manual**: Run the embed modal locally, toggle checkbox, confirm preview reflects state and copied snippet includes/omits the param accordingly.

## Edge Cases to Address
- Legacy embeds without the new parameter should continue working and default to hidden.
- Boolean permutations such as `showAdditionalCost=1`, `true`, `false`, `0`, or uppercase values must be normalized.
- Ensure query tampering cannot accidentally re-enable the field when flag is absent.
- Guard against clipboard-generated snippets missing the param when toggle OFF (should omit rather than set `false`).

## Verification Steps
- `npm run lint`
- `npm run test`
- Manual: start dev server (`npm run dev`), open embed modal for both calculators, toggle the checkbox, and verify preview plus copied iframe markup reflect the expected flag.
