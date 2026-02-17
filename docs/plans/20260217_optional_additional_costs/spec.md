# Optional Additional Costs Toggle — Specification

## 1. Context & Goals (User/Business Perspective)
- Embedded Revenue and CX ROI calculators currently expose an “Additional cost (annual)” input that some partners consider distracting. Marketers want the option to hide this field so visitors focus on the primary ROI levers.
- Primary users: marketing managers configuring iframe embeds via the modal. Secondary users: site visitors interacting with those embeds, who should only see controls marketers intend to highlight.
- Goals: provide a per-embed toggle (default OFF) that removes the Additional cost field and forces calculators to assume zero additional cost unless marketers explicitly opt in. Success = consistent preview/snippet behavior, fewer manual edits, and no regressions to the main-site calculators.

## 2. Non-Goals / Out of Scope
- No changes to ROI formulas, charts, or other calculator inputs.
- No global setting affecting every embed; behavior must remain per iframe configuration.
- No modifications to the non-embed calculators on the primary site.
- No explanatory banners or analytics instrumentation about hidden fields.

## 3. Definitions / Glossary
- **Embed configuration modal**: “Embed” overlay containing preview, input defaults, theming, and snippet generation.
- **Additional cost toggle**: new checkbox controlling whether the Additional cost input appears inside the iframe.
- **Embed visitor**: end user viewing the calculator inside an iframe on a partner site.

## 4. Functional Requirements
### 4.1 User stories
- As a marketing manager configuring an embed, I want a toggle (default OFF) that hides the Additional cost field so visitors are not prompted for it.
- As a marketer who needs that field, I can enable the toggle, exposing the input with the configured default so visitors can edit it.
- As an embed visitor where the field is hidden, I should not see any placeholder or indicator; calculations silently use zero additional cost.
- As a marketer copying the snippet, I expect the preview and generated iframe URL to reflect my toggle choice exactly.

### 4.2 Use cases (happy path + key variants)
- **UC1 – Default hidden**: modal opens with toggle OFF → preview omits the Additional cost input → iframe snippet includes a parameter that keeps the field hidden and hardcodes value zero → embed visitors never see the control.
- **UC2 – Opt-in visible**: marketer turns toggle ON → preview re-renders with the input (populated with configured default) → generated snippet reflects visibility, allowing visitors to edit.
- **UC3 – Legacy snippets**: old embeds lacking the new parameter should default to hidden/off behavior to match the new system default without breaking existing pages.
- **UC4 – Conflicting overrides**: if query params supply a non-zero additionalCost while visibility flag is OFF, calculators still hide the field and treat additional cost as zero.

### 4.3 Edge cases & failure modes
- Missing/malformed toggle parameter: treat as OFF (hidden, zero value).
- Invalid additional cost numbers (negative, NaN) continue to trigger existing validation, but only when the field is visible.
- Embed visitors manually editing the iframe URL to inject additionalCost should be ignored when the toggle indicates hidden.
- Accessibility: when hidden, the control is removed from the DOM so it cannot be focused; no empty labels remain.

## 5. Non-Functional Requirements
- **Performance**: added toggle logic must not introduce noticeable latency; bundle-size impact should be negligible (<1 KB).
- **Reliability**: modal state and copied snippet must stay in sync; the iframe must consistently honor the encoded toggle.
- **Security/privacy**: logic runs entirely client-side; no additional telemetry or external services.
- **Observability**: when conflicting params are detected (hidden flag but non-zero additionalCost), log a console warning for debugging.
- **Accessibility**: the toggle is keyboard operable, labeled clearly, and hidden controls no longer appear in tab order.

## 6. UX / API Contracts (as applicable)
- Embed modal gains a checkbox (e.g., “Show Additional cost input in embed”), default unchecked, near the existing default-input controls.
- Preview panel mirrors the toggle state live: hidden state removes the Additional cost row entirely; visible state shows it with the configured value and existing validation.
- Iframe URLs include a new query parameter (e.g., `showAdditionalCost=true`) when the toggle is ON; absence or `false` keeps the field hidden. Calculators must read this flag alongside numeric overrides.
- No placeholder text, badge, or indicator appears inside the embed when the field is hidden (per user request).

## 7. Data & State
- Modal component state tracks the boolean toggle alongside numeric defaults; no persistence beyond the session.
- `buildEmbedUrl` and `parseEmbedParams` handle the new flag. When `showAdditionalCost` is false/missing, calculators ignore any `additionalCost` override and inject zero into state.
- Main-site calculators continue to initialize from their existing defaults without considering the new flag.

## 8. Acceptance Criteria (Top-level)
- The new toggle defaults to OFF; preview and generated snippet hide Additional cost and calculations assume zero.
- When the toggle is ON, the field appears, accepts user input, and existing validation behaves unchanged.
- Legacy embeds (without the flag) hide the field by default.
- Hidden embeds cannot be coerced into showing or using non-zero additional cost through manual query manipulation.
- Main-site (non-embed) calculators remain unchanged.

## 9. Open Questions
- None; all requirements clarified with the requester.

## 10. Assumptions
- Marketers prefer the Additional cost field to be hidden by default in embeds but still accessible when needed.
- Storing the toggle in query params is acceptable for iframe configuration.
- Partners do not require any notice explaining that additional cost is omitted when hidden.

## 11. References
- Requirement brief — `docs/plans/20260217_optional_additional_costs/idea.md`
