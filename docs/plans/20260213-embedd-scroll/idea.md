Here’s a tight “Option B” implementation brief you can hand to a coding agent for the **Vercel app (child)**. This assumes HubSpot (parent) will run `iframeResizer.min.js` and call `iFrameResize(...)` on the iframe.

---

## Goal

Eliminate the iframe’s internal scrollbar by having the embedded Vercel app **report its content height** to the parent page so HubSpot can automatically resize the iframe.

We’ll use **iframe-resizer** (parent + child).

---

## Changes required in the Vercel app (child)

### 1) Add dependency (preferred) or use CDN

**Preferred (npm):**

```bash
npm i iframe-resizer
# or
yarn add iframe-resizer
# or
pnpm add iframe-resizer
```

(If you can’t/won’t add deps, you can load via CDN, but npm is cleaner.)

---

### 2) Load the iframe-resizer *child* script on embed pages only

You must load the “contentWindow” side **inside** the embedded page (e.g. `/embed/revenue`).

#### If the embed app is Next.js (App Router)

Create a small client component and include it in the embed layout.

**`app/embed/IframeResizerChild.tsx`**

```tsx
'use client';

import { useEffect } from 'react';
import 'iframe-resizer/js/iframeResizer.contentWindow';

export default function IframeResizerChild() {
  // Import side-effect above is enough; this component just ensures it runs on client.
  useEffect(() => {}, []);
  return null;
}
```

**`app/embed/layout.tsx`** (or wherever the embed routes share a layout)

```tsx
import IframeResizerChild from './IframeResizerChild';

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <IframeResizerChild />
        {children}
      </body>
    </html>
  );
}
```

#### If the embed app is Next.js (Pages Router)

Add this to the embed page component (or a shared embed layout component):

```tsx
import { useEffect } from 'react';

export default function EmbedRevenue() {
  useEffect(() => {
    require('iframe-resizer/js/iframeResizer.contentWindow');
  }, []);

  return (/* your embed UI */);
}
```

---

### 3) Remove default margins + prevent horizontal overflow in the embed page

Add CSS that applies on embed routes:

```css
html, body {
  margin: 0;
  padding: 0;
}

body {
  overflow-x: hidden;
}
```

If your embed content is inside a root container, also ensure:

```css
.embed-root {
  width: 100%;
  box-sizing: border-box;
}
```

---

### 4) Make sure the embed page height reflects full content (no fixed viewport wrappers)

Audit the embed route for any container like:

* `height: 100vh`
* `overflow: auto`
* `position: fixed` wrappers
* internal scrolling containers around the whole app

For the embed experience, the page should generally allow the document to grow naturally.

**Fix pattern:**

* Remove `height: 100vh` on the top-level wrapper
* Avoid `overflow: auto` on the main wrapper (only allow scrolling inside small panels if needed)

---

### 5) Optional: Smooth resizing when the UI changes after load

If the calculator changes height dynamically (accordion expands, async data loads), iframe-resizer usually catches it. If not, trigger a resize event after major layout changes.

In the embed app, you can do:

```ts
window.parentIFrame?.size();
```

Call that after big UI expansions (optional).

---

## Acceptance criteria

1. On HubSpot desktop: **no inner scrollbar** inside the iframe; the page scrolls normally.
2. On mobile: iframe resizes to full content height; no cut-off.
3. Resizes correctly after dynamic UI changes (scenario switches / validation errors / expanded sections).

---

## Notes for the agent

* Parent and child must both include iframe-resizer scripts; HubSpot already handles parent.
* Cross-domain (HubSpot ↔ Vercel) is normal; parent config may use `checkOrigin: false`.
* Only load the child script on `/embed/*` routes to avoid affecting the main app.

---

If you tell me whether the Vercel app is **Next.js App Router, Pages Router, or something else (Vite/CRA)**, I’ll tailor the exact file paths and code to match your repo structure.
