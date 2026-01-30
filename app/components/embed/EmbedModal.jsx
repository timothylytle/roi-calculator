'use client';

import { useEffect, useMemo, useState } from 'react';
import ROICalculator from '../ROICalculator';
import CXCalculator from '../CXCalculator';
import Navigation from '../Navigation';
import {
  buildEmbedUrl,
  calculatorConfigs,
  getCalculatorDefaults,
} from '@/app/lib/embed';

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const previewHeight = 540;

const calculatorComponents = {
  revenue: ROICalculator,
  cx: CXCalculator,
};

export default function EmbedModal({
  calculatorType,
  initialValues,
  onClose,
}) {
  const config =
    calculatorConfigs[calculatorType] ?? calculatorConfigs.revenue;
  const [formValues, setFormValues] = useState(() =>
    initializeFormValues(calculatorType, initialValues),
  );
  const [theme, setTheme] = useState('light');
  const [showNavigation, setShowNavigation] = useState(false);
  const [copyState, setCopyState] = useState('idle');

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const { errors, isValid, numericValues } = useMemo(
    () => validateFormValues(formValues, config),
    [formValues, config],
  );

  const previewKey = useMemo(
    () =>
      `${calculatorType}-${theme}-${JSON.stringify(numericValues)}-${showNavigation}`,
    [calculatorType, numericValues, showNavigation, theme],
  );

  const embedUrl = useMemo(
    () => buildEmbedUrl(calculatorType, numericValues, theme, showNavigation),
    [calculatorType, numericValues, theme, showNavigation],
  );

  const iframeSnippet = `<iframe src="${embedUrl}" width="100%" height="${previewHeight + 200}" style="border:0; border-radius:16px;" loading="lazy"></iframe>`;

  const handleCopy = async () => {
    if (!isValid) return;
    try {
      await navigator.clipboard.writeText(iframeSnippet);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2500);
    } catch (error) {
      console.error('Clipboard copy failed', error);
      setCopyState('error');
    }
  };

  const handleFieldChange = (field) => (event) => {
    const { value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const CalculatorComponent =
    calculatorComponents[calculatorType] ?? calculatorComponents.revenue;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-slate-900/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Embed Configuration
            </p>
            <h2 className="text-2xl font-semibold text-slate-800">
              {config.label} Calculator
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
            aria-label="Close embed modal"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-slate-200 space-y-6 max-h-[80vh] overflow-y-auto">
            <section>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Customize Defaults
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Set the initial values the iframe will load with. Visitors can
                still adjust these numbers inside the embedded calculator.
              </p>
              <div className="space-y-4">
                {config.fieldOrder.map((field) => {
                  const meta = config.fields[field];
                  return (
                    <div key={field}>
                      <label className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                        <span>{meta.label}</span>
                        <span className="text-slate-400">
                          Min {meta.min} / Max {meta.max}
                        </span>
                      </label>
                      <input
                        type="number"
                        value={formValues[field]}
                        onChange={handleFieldChange(field)}
                        min={meta.min}
                        max={meta.max}
                        step={meta.step ?? 1}
                        className={`w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 ${
                          errors[field]
                            ? 'border-rose-400 focus:ring-rose-300'
                            : 'border-slate-300 focus:ring-sky-200'
                        }`}
                      />
                      {errors[field] && (
                        <p className="text-xs text-rose-500 mt-1">
                          {errors[field]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  Theme
                </p>
                <div className="flex gap-3">
                  {themeOptions.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`flex-1 border rounded-lg py-2 font-semibold ${
                        theme === option.value
                          ? 'border-sky-500 text-sky-600 bg-sky-50'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={showNavigation}
                  onChange={(event) => setShowNavigation(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                Show floating navigation menu
              </label>
              <p className="text-xs text-slate-500">
                Disable the navigation to avoid redundant chrome inside a
                partner site.
              </p>
            </section>
          </div>

          <div className="w-full lg:w-1/2 bg-slate-50 p-6 space-y-5">
            <section>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Live Preview
              </h3>
              <p className="text-sm text-slate-500 mb-3">
                This simulates the iframe contents using the settings above.
              </p>
              <div
                className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                style={{ height: previewHeight }}
              >
                <EmbedPreview
                  calculatorType={calculatorType}
                  theme={theme}
                  showNavigation={showNavigation}
                >
                  <CalculatorComponent
                    key={previewKey}
                    embedOverrides={numericValues}
                    embedTheme={theme}
                    isEmbed
                  />
                </EmbedPreview>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Paste Snippet
              </h3>
              <p className="text-sm text-slate-500">
                Drop this iframe code into any CMS or website builder that
                supports custom HTML.
              </p>
              <textarea
                className="w-full mt-3 font-mono text-xs border border-slate-300 rounded-lg p-3 bg-white h-28"
                readOnly
                value={iframeSnippet}
              />
              <div className="flex items-center justify-between mt-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!isValid}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    isValid
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {copyState === 'copied' ? 'Copied!' : 'Copy iframe code'}
                </button>
                {copyState === 'error' && (
                  <p className="text-sm text-rose-500">
                    Clipboard blocked. Select text above and copy manually.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmbedPreview({ calculatorType, theme, showNavigation, children }) {
  return (
    <div
      className={`h-full overflow-y-auto ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'
      }`}
    >
      {showNavigation && (
        <Navigation
          activeCalculator={calculatorType}
          onCalculatorChange={() => {}}
          withinContainer
        />
      )}
      {children}
    </div>
  );
}

function initializeFormValues(calculatorType, initialValues = {}) {
  const config =
    calculatorConfigs[calculatorType] ?? calculatorConfigs.revenue;
  const defaults = getCalculatorDefaults(calculatorType) ?? config.defaults;

  return config.fieldOrder.reduce((acc, field) => {
    const value =
      initialValues[field] ?? defaults[field] ?? config.fields[field].defaultValue;
    acc[field] = value === '' || value === undefined ? '' : String(value);
    return acc;
  }, {});
}

function validateFormValues(values, config) {
  const errors = {};
  const numericValues = {};

  config.fieldOrder.forEach((field) => {
    const meta = config.fields[field];
    const raw = values[field];

    if (raw === '' || raw === null || raw === undefined) {
      errors[field] = 'Required';
      numericValues[field] = meta.defaultValue;
      return;
    }

    const parsed = meta.allowFloat ? parseFloat(raw) : parseInt(raw, 10);

    if (Number.isNaN(parsed)) {
      errors[field] = 'Must be a number';
      numericValues[field] = meta.defaultValue;
      return;
    }

    if (typeof meta.min === 'number' && parsed < meta.min) {
      errors[field] = `Must be at least ${meta.min}`;
      numericValues[field] = meta.defaultValue;
      return;
    }

    if (typeof meta.max === 'number' && parsed > meta.max) {
      errors[field] = `Must be at most ${meta.max}`;
      numericValues[field] = meta.defaultValue;
      return;
    }

    numericValues[field] = parsed;
  });

  return { errors, isValid: Object.keys(errors).length === 0, numericValues };
}
