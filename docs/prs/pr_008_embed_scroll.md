# Pull Request Description Template

## 🔍 Summary
- load the iframe-resizer child script on every `/embed/*` route, remove fixed-height wrappers, and add an optional `triggerParentResize()` helper so HubSpot can size the iframe without nested scrollbars
- document a repeatable manual QA flow plus updated plan/spec references so future contributors know how to validate embeds in HubSpot or a local iframe-resizer demo

---

## 🎯 Purpose
HubSpot already runs the parent side of iframe-resizer but our child never emitted its height, forcing marketers to pin iframe heights and live with inner scrollbars. This PR integrates the iframe-resizer child library, enforces embed-safe CSS, and records the verification process so the iframe automatically grows to fit dynamic calculator content on desktop and mobile hosts.

---

## 🧪 Testing
How did you verify it works?

* [x] Added/updated tests
* [ ] Ran `pytest`

Notes:
- `npm run lint`
- `npm run test`
- Manual host verification documented in `docs/plans/20260213-embedd-scroll/manual_verification.md` (to be run on HubSpot or iframe-resizer demo page)

---

## 📌 Related Issues
Closes #N/A

---

## 🚀 Changes
Brief list of main changes:

* Add `iframe-resizer` dependency, new `IframeResizerChild` client shim, embed layout wrapper, `.embed-root` CSS, and Jest coverage for layout + warning behavior.
* Introduce `triggerParentResize()` helper with unit tests to support future manual resize triggers when UI changes dramatically.
* Create manual verification doc plus updated plan/spec references so QA knows how to confirm no inner scrollbars on host pages.

---

## ⚠️ Notes for Reviewers
- Please follow `manual_verification.md` to QA on an actual host (HubSpot or iframe-resizer demo) since this cannot be automated locally.
- Helper is optional; it no-ops if `parentIFrame` is absent, so integrating it later is safe.

---

## 📚 Docs
* [x] Updated plan/spec + added manual verification doc (`docs/plans/20260213-embedd-scroll/…`)
