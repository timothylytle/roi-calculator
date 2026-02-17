import Link from 'next/link';
import ROICalculator from '@/app/components/ROICalculator';
import CXCalculator from '@/app/components/CXCalculator';
import { parseEmbedParams } from '@/app/lib/embed';
import EmbedNavigation from '@/app/embed/EmbedNavigation';

const calculators = {
  revenue: ROICalculator,
  cx: CXCalculator,
};

export default async function EmbedCalculatorPage({
  params,
  searchParams,
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const calculatorType =
    typeof resolvedParams?.calculator === 'string'
      ? resolvedParams.calculator
      : '';
  const CalculatorComponent = calculators[calculatorType];

  if (!CalculatorComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-slate-800">
            Calculator Not Found
          </h1>
          <p className="text-slate-600">
            We couldn&apos;t find the calculator requested in this embed. Please
            double-check the embed code or open the full ROI calculator site.
          </p>
          <Link
            href="/"
            className="inline-flex justify-center rounded-lg px-5 py-3 bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
          >
            Go to ROI Calculators
          </Link>
        </div>
      </div>
    );
  }

  const searchParamsString = buildSearchParamsString(resolvedSearchParams);
  const {
    overrides,
    theme,
    showNavigation,
    showAdditionalCost,
    warnings,
  } = parseEmbedParams(
    searchParamsString,
    calculatorType,
  );

  if (warnings.length > 0) {
    console.warn(`[embed:${calculatorType}] ${warnings.join('; ')}`);
  }

  const backgroundClass =
    theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100';
  const embedUrl = `/embed/${calculatorType}${
    searchParamsString ? `?${searchParamsString}` : ''
  }`;

  return (
    <div
      className={`embed-root ${backgroundClass} relative flex flex-col`}
    >
      {showNavigation && (
        <EmbedNavigation
          activeCalculator={calculatorType}
          searchParamsString={searchParamsString}
        />
      )}
      <CalculatorComponent
        embedOverrides={overrides}
        embedTheme={theme}
        isEmbed
        additionalCostEnabled={showAdditionalCost}
      />
      <div className="px-4 pb-6 text-center text-xs text-slate-400">
        Having trouble viewing the embed?{' '}
        <a
          href={embedUrl}
          target="_blank"
          rel="noreferrer"
          className="text-slate-600 underline-offset-2 hover:underline"
        >
          Open this calculator in a new tab.
        </a>
      </div>
      <noscript>
        <div className="bg-amber-100 text-amber-800 text-sm text-center px-4 py-3 m-4 rounded-lg">
          This calculator requires JavaScript.{' '}
          <a href={embedUrl} className="font-semibold underline">
            Open it in a full browser window
          </a>{' '}
          to continue.
        </div>
      </noscript>
    </div>
  );
}

function buildSearchParamsString(searchParams = {}) {
  if (!searchParams) {
    return '';
  }

  if (typeof searchParams === 'string') {
    return searchParams.replace(/^\?/, '');
  }

  if (searchParams instanceof URLSearchParams) {
    return searchParams.toString();
  }

  const params = new URLSearchParams();

  if (typeof searchParams[Symbol.iterator] === 'function') {
    for (const [key, value] of searchParams) {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    }
    return params.toString();
  }

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined && entry !== null) {
          params.append(key, String(entry));
        }
      });
      return;
    }

    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  return params.toString();
}
