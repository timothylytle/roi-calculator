'use client';

import { useEffect } from 'react';
import 'iframe-resizer/js/iframeResizer.contentWindow';

export default function IframeResizerChild() {
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.parentIFrame) {
      console.warn('[embed] parentIFrame not detected; iframe may not resize');
    }
  }, []);

  return null;
}
