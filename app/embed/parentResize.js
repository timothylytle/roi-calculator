/**
 * Safely request the host page to resize the iframe. Useful after major DOM changes
 * in the embedded calculator (e.g., accordions opening). No-op if iframe-resizer
 * is not available.
 */
export function triggerParentResize() {
  if (typeof window === 'undefined') return;
  if (window.parentIFrame && typeof window.parentIFrame.size === 'function') {
    window.parentIFrame.size();
  }
}
