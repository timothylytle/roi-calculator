# Codebase Research for ROI Calculators

## 1. Research Scope
- Spec file `spec.md` is not present in the repo (validated via `rg --files -g 'spec.md'`), so this research references the currently checked-in implementation as of today and the general ROI calculator description in `AGENTS.md`.
- Inspected areas: `app/page.js`, `app/components/*`, `app/layout.js`, `app/globals.css`, config files (`package.json`, `eslint.config.mjs`, `next.config.mjs`, `postcss.config.mjs`, `jsconfig.json`), and `public/` assets to understand the running surface.

## 2. Repo Orientation
- **How to run/build/test:** The project exposes `npm run dev`, `npm run build`, `npm run start`, and `npm run lint` through `package.json:5-22`. No automated tests are defined.
- **Key directories:**
  - `app/` – Next.js App Router entry with layouts, global styles, and calculator components.
  - `app/components/` – Client components for navigation and the two ROI calculators.
  - `public/` – Static SVG assets referenced by the UI if needed.
- **Tech Stack Snapshot (as-is):** Next.js 16 App Router, React 19 client components, Tailwind CSS 4-inlined tokens (`app/globals.css:1-26`), Recharts for visualization (`app/components/ROICalculator.jsx:4`, `app/components/CXCalculator.jsx:4`), ESLint with `eslint-config-next` (`eslint.config.mjs:1-16`). No backend code, database integration, or test frameworks are present.

## 3. Relevant Components (Map)
- **`app/layout.js:1-28` (RootLayout):**
  - Sets global fonts via `next/font/google` (`Geist`, `Geist_Mono`) and wraps children with metadata describing the calculators.
  - Inputs: `children` React nodes (Next injects page components). Outputs: `<html>`/`<body>` tags with font variables for Tailwind tokens.
  - Only Next.js calls this component; it does not invoke other local modules beyond CSS and fonts.
- **`app/page.js:1-19` (Home):**
  - Controls which calculator is visible by managing `activeCalculator` state and rendering either `ROICalculator` or `CXCalculator`.
  - Receives no props; renders `<Navigation>` with the current selection and setter.
  - Acts as the primary integration point—child calculators are assumed to be client components (note `'use client'`).
- **`app/components/Navigation.jsx:1-129` (Navigation menu):**
  - Maintains `isOpen` state for the dropdown and closes when clicking outside via `useRef` + `useEffect` (`lines 6-20`).
  - Defines an in-component `calculators` array describing each calculator (`lines 21-34`); buttons update the parent through `onCalculatorChange` (`lines 36-40`, `80-123`).
  - Inputs: `activeCalculator`, `onCalculatorChange`. Outputs: user events that toggle `isOpen` and fire the callback with selected `id`. Relies on DOM event listeners, so it must run on the client.
- **`app/components/ROICalculator.jsx:1-504` (Revenue Intelligence ROI calculator):**
  - Local state stores user inputs for pricing, team size, pipeline volume, conversion rate, deal value, and additional cost (`lines 6-13`). `results` state holds derived metrics (`line 14`).
  - `useEffect` recomputes whenever inputs change by calling `calculateROI` (`lines 16-19`).
  - `calculateROI` derives closed deals, annual revenue, investment, scenario projections (+1, +5, +10 percentage point lifts), ROI %, net gain, cumulative chart data, and break-even months (`lines 20-87`). The break-even values determine ReferenceLines in the chart (`lines 368-447`).
  - Formatting helpers (`lines 90-113`) standardize currency/percent output.
  - Render tree: input forms for user data (`lines 115-215`), scenario summaries and cards, ROI impact callout (`lines ~216-310`), and a Recharts `ComposedChart` showing cumulative value with cost reference plus break-even data (`lines 313-500`).
  - Inputs: controlled form fields bound to local state. Outputs: DOM markup of metrics and charts driven by `results`. Called only from `Home`, but entirely self-contained otherwise.
- **`app/components/CXCalculator.jsx:1-506` (CX Intelligence retention calculator):**
  - Similar pattern with state for agent count, customers, churn, revenue per customer, gross margin, and additional costs (`lines 6-14`).
  - `calculateROI` models customers lost to churn, retained revenue under 5%/10% churn reductions, ROI/net gain, chart data, and break-even periods (`lines 21-88`).
  - Format helpers mirror the revenue calculator (`lines 90-113`).
  - UI parallels revenue calculator but uses CX-specific copy and emerald color palette, culminating in a Recharts view with cost line and payback markers (`lines 341-502`).
  - Inputs/outputs follow the same pattern: user-controlled fields feed state, `results` drives scenario cards and charts.
- **`app/globals.css:1-26` (Global theme):**
  - Imports Tailwind (`@import "tailwindcss"`), defines CSS custom properties for light/dark backgrounds, maps them to Tailwind inline theme tokens, and applies base body styles. Serves as styling foundation for class names used throughout components.

## 4. Data Flow (As-Is)
- Next.js loads `RootLayout`, which injects fonts and applies global styles. `Home` mounts as a client component.
- Initial render sets `activeCalculator` to `'revenue'`, so `<ROICalculator>` mounts. `Navigation` also mounts, listening for outside clicks.
- Within each calculator, user inputs are controlled components bound to local `useState`. Changing any input updates state, triggering the `useEffect` watcher to recompute `results`.
- `calculateROI`/`calculateROI` (CX variant) consolidate numeric inputs into derived figures that populate cards, textual summaries, and Recharts data arrays.
- Recharts components consume `results.chartData` alongside investment data; break-even calculations produce `ReferenceLine` markers. The displayed metrics thus reflect the last computed `results`.
- No network requests or persistence occur; all data stays in component state and is recalculated client-side on every change.

## 5. Extension Points / Integration Surfaces (As-Is)
- `Navigation`’s `calculators` array (`app/components/Navigation.jsx:21-34`) is the enumerated source of selectable calculators; adding/removing calculators would require adjusting this list and ensuring `Home` understands the IDs.
- `Home` selects the calculator via conditional rendering (`app/page.js:13-18`). Any new calculator must be imported and added to this branching logic or broken into a different routing strategy.
- Both calculators encapsulate their input schemas and computations. New metrics can slot into their `useState` declarations and `calculateROI` function, but the results object is tightly coupled to the existing UI (e.g., scenario arrays with fixed lengths). Extending requires coordinating the UI sections that expect specific keys.
- Styling relies on Tailwind utility classes defined inline; additions should either continue using this approach or extend `app/globals.css` tokens to maintain consistency.

## 6. Candidate Incorporation Paths (Observational)
- **Path A – New calculator component alongside existing ones**
  - Location: new file under `app/components/`, import into `app/page.js`, append metadata in `Navigation`.
  - Pros: Aligns with existing pattern of fully self-contained calculators; minimizes risk of interfering with current revenue/CX logic.
  - Cons: Duplicates layout markup, so shared changes require touching multiple files. Routing remains manual via conditional blocks.
  - Assumptions: New use case can operate entirely client-side with local state and Recharts visualizations.
  - Unknowns: Desired calculator ID/labels, whether navigation should remain as dropdown vs. other UI.
- **Path B – Extend existing calculators with additional inputs/outputs**
  - Location: augment `calculateROI` functions, `results` shape, and presentation sections in either calculator file.
  - Pros: Keeps experience consolidated if new metrics relate directly to revenue or churn; reuses existing break-even chart and scenario cards.
  - Cons: Current `results` schema is keyed to fixed scenario arrays; changing lengths or semantics requires reworking card rendering loops and chart data assumptions.
  - Assumptions: New behavior fits within the same general ROI narrative (e.g., new scenario types or metrics).
  - Unknowns: Whether UI has room for more cards/inputs without redesign.
- **Path C – Route-level separation per calculator**
  - Location: split calculators into dedicated route segments under `app/` (e.g., `app/revenue/page.js`).
  - Pros: Allows deep links/bookmarks per calculator and isolates state per route, using Next.js routing features already available.
  - Cons: Requires rethinking navigation because current dropdown assumes a single page; also affects metadata/layout if calculators diverge.
  - Assumptions: Future spec may demand shareable URLs or SEO for each calculator.
  - Unknowns: Whether marketing requirements prefer single-page switching or multi-route flow.

## 7. Tests & Tooling (As-Is)
- **Tooling:** Uses Next.js scripts plus ESLint (`npm run lint`). Tailwind CSS v4 runs through the PostCSS plugin (`postcss.config.mjs:1-6`). No formatting or testing scripts are defined.
- **Testing:** There are no Jest/Playwright/Cypress suites or test directories. Any new functionality currently lacks automated coverage to extend or reference.
- **CI/CD:** No `.github/workflows`, Dockerfiles, or other CI configs are present, so builds/tests likely run manually or through Vercel defaults. There are no configured service containers or databases.
- **Pattern applicability assessment:**
  - *Calculator module pattern:* Each calculator is a standalone client component with `useState`, `useEffect`, and a `calculate` helper returning a `results` object plus Recharts binding (`app/components/ROICalculator.jsx:6-504`, `app/components/CXCalculator.jsx:6-506`). This pattern can be reused for similar calculators as long as the calculations remain synchronous and client-side.
  - *Navigation pattern:* A dropdown referencing a static `calculators` array and invoking `onCalculatorChange` (`app/components/Navigation.jsx:21-123`). It can enumerate additional calculators without structural changes, but assumes only one active calculator at a time and requires the parent to recognize the ID.
  - *Styling pattern:* Tailwind classes applied inline with shared color tokens. Reusing these styles requires the same utility approach; no CSS modules or styled-components exist.
- **Dependency gap analysis:** Current dependencies cover React/Next, Recharts, and Tailwind. There is no HTTP client, server action, or state management library beyond React state. Therefore, any spec demanding persistent storage, remote data fetching, or more advanced chart types would require introducing new dependencies because no existing modules implement those concerns.

## 8. Open Questions
- Where is the detailed spec (version, acceptance criteria, target behaviors)? `spec.md` referenced in instructions is missing, so requirements are inferred only from current UI.
- Does the future work require additional calculators, new metrics within existing calculators, or route changes? This affects whether Path A, B, or C is viable.
- Are there requirements for analytics, persistence, or integrations (e.g., exporting results)? No infrastructure exists for those today, so clarification is needed before planning.

## 9. Evidence Appendix
- Commands run: `ls`, `ls app`, `ls app/components`, `cat README.md`, `rg --files -g 'spec.md'`, `nl -ba app/page.js`, `nl -ba app/components/Navigation.jsx`, `nl -ba app/components/ROICalculator.jsx`, `nl -ba app/components/CXCalculator.jsx`, `nl -ba app/layout.js`, `nl -ba app/globals.css`, `nl -ba package.json`, `cat eslint.config.mjs`, `cat postcss.config.mjs`, `cat next.config.mjs`, `ls public`.
