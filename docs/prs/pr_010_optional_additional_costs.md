# ull Request Description Template

## 🔍 Summary

- Add an embed-modal checkbox that lets marketers hide the Additional cost input and default embeds to zero additional cost unless explicitly enabled.
- Teach the embed URL helpers plus `/embed/[calculator]` entry point to serialize/parse `showAdditionalCost`, clamp conflicting overrides, and pass the resulting flag into calculators.
- Update both ROI calculator components to respect the flag only in embed mode and add coverage that verifies hidden inputs, annual investment math, and helper behavior.

---

## 🎯 Purpose

Partners embedding the calculators asked for a way to remove the Additional cost field so visitors aren't forced to reason about a value they don't use. This PR ships a first-class toggle that keeps embeds consistent with that preference, ensures ROI math stays accurate (the value is now always zero when hidden), and documents the behavior through a spec and phased plan for future maintainers.

---

## 🧪 Testing

How did you verify it works?

* [x] Added/updated tests
* [ ] Ran `pytest`

Notes:
- `npm run lint`
- `npm run test`
- Manual spot-check: embed modal toggle reflects in preview/snippet; iframe respects `showAdditionalCost` flag

---

## 📌 Related Issues

Closes #N/A

---

## 🚀 Changes

Brief list of main changes:

* Embed spec/plan docs captured for the optional Additional cost requirement.
* Embed modal, URL builder, and parser now support `showAdditionalCost` with a default-off checkbox plus warning for conflicting params.
* Revenue and CX calculators hide the Additional cost input (and assume zero) when embeds disable it; new Jest tests cover helpers and component behavior.

---

## ⚠️ Notes for Reviewers

* Manual verification on a hosted embed is recommended to confirm partner CMSes copy the new param correctly.
* Console will warn if someone passes `additionalCost` while the field is hidden—leave as-is for easier debugging.

---

## 📚 Docs

* [x] Updated spec/plan files under `docs/plans/20260217_optional_additional_costs/`
