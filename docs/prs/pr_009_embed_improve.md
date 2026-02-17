# Pull Request Description Template

## 🔍 Summary
- add an “Include iframe-resizer parent script” toggle to the embed modal so HubSpot editors can paste a single snippet that auto-resizes without manual script wiring
- bump default `pricePerAgent` values (Revenue → 129, CX → 99) so new embeds reflect updated pricing assumptions

---

## 🎯 Purpose
Hosts like HubSpot often need the parent-side iframe-resizer snippet alongside the iframe, and manually pasting both pieces is error-prone. Providing a built-in toggle plus updated pricing defaults lets marketers copy one snippet that already includes responsive markup, optional scripts, and the correct price baseline.

---

## 🧪 Testing
How did you verify it works?

* [x] Added/updated tests
* [ ] Ran `pytest`

Notes:
- `npm run lint`
- `npm run test`

---

## 📌 Related Issues
Closes #N/A

---

## 🚀 Changes
Brief list of main changes:

* Embed modal now offers a checkbox to append the iframe-resizer CDN script + initializer; snippet generation logic and RTL tests updated accordingly.
* Documentation plan (SDD) updated to capture the new script block logic.
* Default `pricePerAgent` values increased to 129 (Revenue) and 99 (CX).

---

## ⚠️ Notes for Reviewers
- Manual QA: confirm that enabling the toggle produces snippet HTML that includes both the existing responsive wrapper and the iframe-resizer script block.

---

## 📚 Docs
* [ ] Updated ...
