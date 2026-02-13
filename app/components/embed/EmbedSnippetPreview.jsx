'use client';

import { DEFAULT_STATIC_DIMENSIONS } from '@/app/lib/embedSizing';

export default function EmbedSnippetPreview({
  isResponsive,
  staticDimensions,
  children,
}) {
  if (isResponsive) {
    const ratio =
      (DEFAULT_STATIC_DIMENSIONS.height / DEFAULT_STATIC_DIMENSIONS.width) * 100;
    return (
      <div className="hs-responsive-embed-preview" aria-label="Responsive preview">
        <div
          className="hs-responsive-embed"
          style={{ borderRadius: '0.75rem', border: '1px solid rgb(226 232 240)' }}
        >
          <div
            className="hs-responsive-embed__wrapper"
            style={{ paddingBottom: `${ratio}%` }}
          >
            <div className="hs-responsive-embed__frame overflow-y-auto rounded-xl">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="static-embed-preview border border-slate-200 rounded-xl bg-white overflow-auto"
      style={{
        width: `${staticDimensions.width}px`,
        height: `${staticDimensions.height}px`,
      }}
      aria-label="Static preview"
    >
      {children}
    </div>
  );
}
