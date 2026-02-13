# Pull Request Description Template

## 🔍 Summary
- add responsive vs static sizing controls inside the embed modal, including validation, preview alignment, and updated snippet output for HubSpot’s `.hs-responsive-embed` wrapper
- introduce reusable sizing helpers, Jest/RTL test infrastructure, and coverage for both the helper logic and modal behavior
- document the initiative with a dedicated spec/idea plus updated phase plans and planning SDD

---

## 🎯 Purpose
Partners embedding the calculators through HubSpot received a fixed `width="800" height="600"` iframe that broke on mobile and required manual tweaks. This PR lets marketers pick a responsive HubSpot wrapper or explicit pixel dimensions directly inside the modal, preview the result, and copy the correctly formatted snippet without editing code. It also records the requirements/spec so the work is reproducible.

---

## 🧪 Testing
How did you verify it works?

* [x] Added/updated tests
* [ ] Ran `pytest`

Notes:
- `npm run test`
- `npm run lint`
- manual spot check of the embed modal sizing toggle and preview behavior

---

## 📌 Related Issues
Closes #N/A (internal planning item)

---

## 🚀 Changes
Brief list of main changes:

* embed modal gains sizing toggle, static dimension inputs, copy gating, and responsive/static preview containers
* snippet generation now emits HubSpot’s wrapper in responsive mode and pixel dimensions in static mode; instructions call out the wrapper requirement
* added `app/lib/embedSizing.js`, RTL/Jest infrastructure, new tests, and updated planning/spec docs under `docs/plans/20260213-embed_scaling/`

---

## ⚠️ Notes for Reviewers
- Responsive mode uses a CSS wrapper only (no postMessage resize scripts) per HubSpot guidance; hosts must keep the wrapper markup intact.
- Static dimensions are clamped between 320–2000px width and 400–2000px height to avoid unreadable embeds.
- All new tests live under Jest; no Playwright coverage due to sandbox constraints.

---

## 📚 Docs
* [x] Updated spec/plan docs (`docs/plans/20260213-embed_scaling/…`)
