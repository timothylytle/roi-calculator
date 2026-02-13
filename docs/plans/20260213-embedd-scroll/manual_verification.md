# Embed Scroll Sync — Manual Verification

1. **Prepare local iframe-resizer demo**
   - Create a simple HTML page containing:
     ```html
     <script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.9/iframeResizer.min.js"></script>
     <iframe id="roi-embed" src="https://your-local-host/embed/revenue" width="100%" style="border:0;"></iframe>
     <script>
       iFrameResize({ checkOrigin: false }, '#roi-embed');
     </script>
     ```
   - Alternatively, use HubSpot landing page custom HTML with the same snippet.

2. **Desktop QA**
   - Load the host page and confirm the iframe height matches calculator content (no inner scrollbar).
   - Interact with the calculator (open accordions, trigger validation errors). Ensure the iframe resizes within ~250 ms, and only the host page scrolls.

3. **Mobile QA**
   - Use browser devtools device emulation or a mobile device to load the host page.
   - Confirm the iframe expands to full content height with no clipping or nested scroll.

4. **Fallback checks**
 - Temporarily block the iframe-resizer script (comment out `iFrameResize`). Verify the calculator still renders with the default height and document that hosts must re-enable iframe-resizer.

5. **Regression spot-check**
  - Open the calculator directly at `/embed/revenue` (without parent) to ensure the layout still renders correctly with `.embed-root` styles.

## Optional manual resize helper
- When a calculator interaction dramatically changes layout (e.g., expanding an infrequently used details section), call `triggerParentResize()` from `app/embed/parentResize.js` after the state change. It safely no-ops if `parentIFrame` is unavailable, so it can be wired into existing components without guards.
