'use client';

import {
  MAX_DIMENSION,
  MIN_HEIGHT,
  MIN_WIDTH,
} from '@/app/lib/embedSizing';

export default function EmbedSizingControls({
  isResponsive,
  staticDimensions,
  errors,
  onToggleResponsive,
  onDimensionChange,
}) {
  return (
    <section className="space-y-3 border-t border-slate-200 pt-4">
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-1">Sizing</p>
        <p className="text-xs text-slate-500">
          Choose whether the iframe should stretch to the container (responsive)
          or keep explicit dimensions.
        </p>
      </div>
      <div className="flex gap-3" role="group" aria-label="Embed sizing mode">
        <button
          type="button"
          onClick={() => onToggleResponsive(true)}
          aria-pressed={isResponsive}
          className={`flex-1 border rounded-lg py-2 font-semibold transition ${
            isResponsive
              ? 'border-sky-500 text-sky-600 bg-sky-50'
              : 'border-slate-200 text-slate-600'
          }`}
        >
          Responsive (recommended)
        </button>
        <button
          type="button"
          onClick={() => onToggleResponsive(false)}
          aria-pressed={!isResponsive}
          className={`flex-1 border rounded-lg py-2 font-semibold transition ${
            !isResponsive
              ? 'border-slate-800 text-slate-900 bg-slate-100'
              : 'border-slate-200 text-slate-600'
          }`}
        >
          Static dimensions
        </button>
      </div>
      {isResponsive ? (
        <p className="text-xs text-slate-500">
          Copies HubSpot’s responsive wrapper so the iframe inherits the parent
          column width.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['width', 'height'].map((field) => {
            const inputId = `embed-${field}-input`;
            return (
              <div key={field}>
                <label
                  className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide"
                  htmlFor={inputId}
                >
                  {field === 'width' ? 'Width (px)' : 'Height (px)'}
                </label>
                <input
                  id={inputId}
                  type="number"
                  inputMode="numeric"
                min={field === 'width' ? MIN_WIDTH : MIN_HEIGHT}
                max={MAX_DIMENSION}
                  value={staticDimensions[field]}
                  onChange={onDimensionChange(field)}
                  className={`w-full border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 ${
                    errors[field]
                      ? 'border-rose-400 focus:ring-rose-300'
                      : 'border-slate-300 focus:ring-sky-200'
                  }`}
                />
                {errors[field] && (
                  <p className="text-xs text-rose-500 mt-1">{errors[field]}</p>
                )}
              </div>
            );
          })}
          <p className="text-xs text-slate-500 sm:col-span-2">
            Width must be between 320–2000px; height must be 400–2000px.
          </p>
        </div>
      )}
    </section>
  );
}
