# Embed Scaling — Specification

## 1. Context & Goals (User/Business Perspective)
- ROI calculators can already be embedded via iframe snippets generated in the Embed modal, but the snippet hard-codes `width="800" height="600"`, making embeds unusable on narrow HubSpot CMS layouts and forcing scroll bars.
- Marketing teams want a "responsive" option so the iframe automatically stretches to available width inside HubSpot landing pages (per HubSpot KB guidance on `.hs-responsive-embed`) without requiring custom code.
- They also need a "static" option to specify width/height pixels when a partner prefers a fixed canvas; both behaviors must be configurable directly in the embed UI so marketers do not edit HTML manually.
- Success: the embed modal exposes a clear toggle for responsive vs static sizing, live preview reflects the choice, and the copied snippet produces an iframe that (a) adapts to HubSpot's responsive wrapper when enabled and (b) respects explicit dimensions otherwise, while calculators themselves continue to render correctly on mobile within the iframe.

## 2. Non-Goals / Out of Scope
- No script-based auto-resizing (postMessage, observers) beyond HubSpot's CSS wrapper.
- No changes to calculator business logic, metric calculations, or theming beyond what already exists for embeds.
- No additional distribution mechanisms (e.g., script tags, React widgets) besides the current iframe snippet.

## 3. Definitions / Glossary
- **Responsive mode**: iframe wrapped in HubSpot's `.hs-responsive-embed` container so width is 100% and height is determined by CSS aspect ratio.
- **Static mode**: iframe uses explicit `width`/`height` attributes supplied by the marketer.
- **Embed modal**: existing configuration overlay (`app/components/embed/EmbedModal.jsx`) that outputs the iframe code.
- **HubSpot wrapper**: markup recommended in HubSpot KB “Add external content to website pages” for responsive embeds (https://knowledge.hubspot.com/website-pages/add-external-content-to-website-pages).

## 4. Functional Requirements
### 4.1 User stories
- As a marketing manager configuring embeds, I can toggle between responsive and static sizing inside the Embed modal so I match the destination site’s layout without editing HTML.
- As a marketing manager, when responsive mode is selected, the generated code includes HubSpot’s `.hs-responsive-embed` wrapper and 100% width so embeds stay fluid on HubSpot landing pages and other CMS targets.
- As a marketing manager, when static mode is selected, I can enter explicit width/height pixel values that are validated before I copy the snippet.
- As a marketer previewing changes, I can see the simulator update immediately when I switch sizing modes or dimensions so I trust what will render after copying the iframe.
- As an external publisher embedding the snippet, I get a mobile-friendly calculator experience (responsive mode) or the requested fixed canvas (static mode) without overflow glitches.

### 4.2 Use cases (happy path + key variants)
- **UC1: Responsive embed configuration** — User opens modal, leaves the default responsive toggle ON, optionally edits calculator inputs/theme/navigation, copies snippet, pastes into HubSpot page; iframe stretches to container width with preserved aspect ratio.
- **UC2: Static embed with custom dimensions** — User toggles responsive mode OFF, fills width/height inputs (e.g., 900×900), preview adjusts to mock the fixed canvas, copy action emits iframe with those attributes; host site displays the calculator in that exact size.
- **UC3: Validation fallback** — User enters invalid dimensions (e.g., blank, <320px width); modal displays inline errors, disables copy, and preview highlights the issue until valid values are provided.
- **UC4: Toggle switching** — User experiments by switching between responsive and static multiple times; modal preserves previously entered static dimensions, recalculates preview states, and updates snippet string accordingly.

### 4.3 Edge cases & failure modes
- Responsive snippet only: ensure fallback text instructs hosts to wrap iframe if they strip the wrapper (document in instructions section).
- Static dimensions must be clamped to a minimum (e.g., width >= 320px, height >= 400px) to avoid unreadable calculators; maximum should prevent absurd sizes (e.g., 2000px width).
- If clipboard write fails, existing error path still applies; snippet area must still reflect the chosen sizing so manual copy works.
- Embed route must continue to honor current query parameters (theme, navigation, overrides) regardless of sizing mode (no extra params required since sizing is handled outside the iframe).
- Preview container should mimic responsive behavior using CSS classes rather than actual iframe injection, so we can simulate `.hs-responsive-embed` vs fixed-size boxes for user confidence.

## 5. Non-Functional Requirements
- Performance: Responsive wrapper must not add measurable load; generated iframe remains same URL, so TTFB/CLS budgets stay aligned with existing embeds (<2s initial render on broadband).
- Security/privacy: No new domains/scripts introduced; snippet remains plain iframe + optional wrapper div; ensure instructions avoid inline JS to respect host CSP.
- Reliability: Modal state should persist during session (e.g., toggling doesn’t reset other form fields). Snippet generation must be deterministic so QA can verify outputs against snapshots.
- Observability: Consider logging toggle usage (optional) to understand adoption; not required for MVP but call out if analytics integration exists.
- Accessibility: New inputs/toggles must be keyboard accessible and labeled; preview should have descriptive text for screen readers describing responsive vs static states.

## 6. UX / API Contracts (as applicable)
- **Modal structure**:
  - Add a “Sizing” section near theme/navigation controls with a toggle: Responsive (default, described as HubSpot-friendly) vs Static.
  - When static is selected, display two number inputs (Width px, Height px) with helper text, min/max validation, and inline error messaging.
  - Responsive explanation text should mention `.hs-responsive-embed` wrapper and link to HubSpot KB reference.
- **Preview behavior**:
  - Responsive mode: preview box should show a fluid width container with aspect-ratio placeholder (e.g., 16:9 default or based on preview height/width) so users see extra vertical space when the calculator expands.
  - Static mode: preview container should fix width/height to the entered values (or scaled representation) and show scroll bars if the calculator content would exceed height.
- **Generated snippet**:
  - Responsive mode output (example formatting):
    ```html
    <div class="hs-responsive-embed">
      <div class="hs-responsive-embed__wrapper">
        <iframe src="https://example.com/embed/revenue?..." width="100%" height="100%" style="border:0;border-radius:16px;" loading="lazy"></iframe>
      </div>
    </div>
    ```
    (Exact class names per HubSpot doc; include fallback note if host strips classes.)
  - Static mode output should remain a single iframe tag with explicit width/height attributes set to the validated pixel values.
  - Snippet text area and copy button must reflect whichever mode is active; no additional script tags are appended.
- **Instructions text**:
  - Add short guidance under the textarea describing how to drop the snippet into HubSpot and reminding users to keep the wrapper when responsive is on.

## 7. Data & State
- Extend modal state with `isResponsive` boolean (default true) and `staticDimensions = { width, height }` persisted while modal is open.
- Validation state must include new errors for width/height and feed into existing `isValid` gating for copy button.
- `buildEmbedUrl` and existing configs remain unchanged (sizing not part of URL).
- Optionally store last-used sizing preference in `localStorage` if product wants persistence beyond session (not yet requested; flag as assumption if omitted).

## 8. Acceptance Criteria (Top-level)
- Responsive mode ON by default; copying snippet yields wrapper + 100% width/height iframe that renders correctly on a sample HubSpot page without manual edits.
- Static mode enforces min/max validation, updates preview, and outputs iframe with requested dimensions; QA can verify by pasting into an HTML sandbox.
- Switching modes updates preview/snippet instantly without losing other embed settings.
- No regressions to existing embed parameters (theme, navigation, calculator defaults) – manual QA ensures overrides still apply when iframe loads.
- Documentation/instructions reference HubSpot KB link and warn about keeping the wrapper for responsive behavior.

## 9. Open Questions
- Should we remember last-used sizing mode per browser via localStorage? (Currently default = responsive; decision deferred unless marketing asks for persistence.)
- Do we need aspect-ratio presets for responsive mode (e.g., 4:3 vs 16:9) or is using calculator height sufficient? (Assumed: use current preview height; add to backlog if publishers need more control.)

## 10. Assumptions
- HubSpot hosts accept the `.hs-responsive-embed` markup without extra modules; other CMSes can ignore the wrapper but should still see a 100% width iframe.
- Static mode inputs accept integers only (no percentages); marketers are comfortable supplying pixel values.
- Marketing is fine with responsive wrapper not auto-adjusting height via JS; calculator content is tall enough to avoid major whitespace issues when aspect ratio differs.
- Existing clipboard error handling and preview infrastructure suffice; we do not add new toast systems.

## 11. References
- HubSpot KB: “Add external content to website pages” — https://knowledge.hubspot.com/website-pages/add-external-content-to-website-pages
- Internal idea brief: `docs/plans/20260213-embed_scaling/idea.md`
- Current embed spec for context: `docs/plans/20260130-add-embed/spec.md`
