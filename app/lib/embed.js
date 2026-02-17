const revenueFields = {
  pricePerAgent: {
    label: 'Price per agent (monthly)',
    min: 0,
    max: 2000,
    step: 1,
    defaultValue: 129,
  },
  salesAgents: {
    label: 'Sales agents using platform',
    min: 0,
    max: 100000,
    step: 1,
    defaultValue: 100,
  },
  leadsPerMonth: {
    label: 'Qualified leads per month',
    min: 0,
    max: 100000,
    step: 1,
    defaultValue: 500,
  },
  closeRate: {
    label: 'Current close rate (%)',
    min: 1,
    max: 40,
    step: 0.5,
    defaultValue: 3.5,
    allowFloat: true,
  },
  avgDealValue: {
    label: 'Average deal value',
    min: 0,
    max: 10000000,
    step: 100,
    defaultValue: 42000,
  },
  additionalCost: {
    label: 'Additional cost (annual)',
    min: 0,
    max: 10000000,
    step: 100,
    defaultValue: 0,
  },
};

const cxFields = {
  pricePerAgent: {
    label: 'Price per agent (monthly)',
    min: 0,
    max: 2000,
    step: 1,
    defaultValue: 99,
  },
  agentsUsingPlatform: {
    label: 'Agents using platform',
    min: 0,
    max: 100000,
    step: 1,
    defaultValue: 100,
  },
  activeCustomers: {
    label: 'Active customers',
    min: 0,
    max: 200000,
    step: 1,
    defaultValue: 1000,
  },
  churnRate: {
    label: 'Annual churn rate (%)',
    min: 1,
    max: 60,
    step: 1,
    defaultValue: 20,
    allowFloat: true,
  },
  avgRevenuePerCustomer: {
    label: 'Avg. annual revenue per customer',
    min: 0,
    max: 1000000,
    step: 100,
    defaultValue: 5000,
  },
  grossMargin: {
    label: 'Gross margin (%)',
    min: 10,
    max: 100,
    step: 5,
    defaultValue: 100,
    allowFloat: true,
  },
  additionalCost: {
    label: 'Additional cost (annual)',
    min: 0,
    max: 10000000,
    step: 100,
    defaultValue: 0,
  },
};

const buildDefaults = (fields, fieldOrder) =>
  fieldOrder.reduce((acc, key) => {
    acc[key] = fields[key].defaultValue;
    return acc;
  }, {});

export const calculatorConfigs = {
  revenue: {
    label: 'Revenue Intelligence',
    supportsAdditionalCostToggle: true,
    showAdditionalCostDefault: false,
    fieldOrder: [
      'pricePerAgent',
      'salesAgents',
      'leadsPerMonth',
      'closeRate',
      'avgDealValue',
      'additionalCost',
    ],
    fields: revenueFields,
  },
  cx: {
    label: 'CX Intelligence',
    supportsAdditionalCostToggle: true,
    showAdditionalCostDefault: false,
    fieldOrder: [
      'pricePerAgent',
      'agentsUsingPlatform',
      'activeCustomers',
      'churnRate',
      'avgRevenuePerCustomer',
      'grossMargin',
      'additionalCost',
    ],
    fields: cxFields,
  },
};

Object.values(calculatorConfigs).forEach((config) => {
  config.defaults = buildDefaults(config.fields, config.fieldOrder);
});

export function getCalculatorDefaults(type) {
  return calculatorConfigs[type]?.defaults
    ? { ...calculatorConfigs[type].defaults }
    : {};
}

export function sanitizeNumber(rawValue, meta) {
  const defaultValue = meta.defaultValue;
  if (rawValue === undefined || rawValue === null) {
    return { value: defaultValue, usedDefault: true, reason: 'missing' };
  }

  const parsed = meta.allowFloat
    ? parseFloat(rawValue)
    : parseInt(rawValue, 10);

  if (Number.isNaN(parsed)) {
    return { value: defaultValue, usedDefault: true, reason: 'not-a-number' };
  }

  if (typeof meta.min === 'number' && parsed < meta.min) {
    return { value: defaultValue, usedDefault: true, reason: 'below-min' };
  }

  if (typeof meta.max === 'number' && parsed > meta.max) {
    return { value: defaultValue, usedDefault: true, reason: 'above-max' };
  }

  return { value: parsed, usedDefault: false };
}

export function buildEmbedUrl(
  calculatorType,
  values,
  theme = 'light',
  showNavigation = false,
  options = {},
) {
  const config = calculatorConfigs[calculatorType];
  if (!config) {
    throw new Error(`Unknown calculator type: ${calculatorType}`);
  }

  const { showAdditionalCost = false } = options;
  const params = new URLSearchParams();
  config.fieldOrder.forEach((field) => {
    const value = values[field];
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !Number.isNaN(value)
    ) {
      params.set(field, value);
    }
  });

  if (theme === 'dark') {
    params.set('theme', 'dark');
  }
  if (showNavigation) {
    params.set('showNavigation', 'true');
  }
  if (config.supportsAdditionalCostToggle && showAdditionalCost) {
    params.set('showAdditionalCost', 'true');
  }

  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';

  return `${origin}/embed/${calculatorType}?${params.toString()}`;
}

function normalizeBoolean(rawValue, defaultValue = false) {
  if (rawValue === undefined || rawValue === null) {
    return defaultValue;
  }

  const value = String(rawValue).toLowerCase();
  if (value === 'true' || value === '1') {
    return true;
  }
  if (value === 'false' || value === '0') {
    return false;
  }

  return defaultValue;
}

export function parseEmbedParams(searchParams, calculatorType) {
  const config = calculatorConfigs[calculatorType];
  if (!config) {
    return {
      overrides: {},
      theme: 'light',
      showNavigation: false,
      showAdditionalCost: true,
      warnings: ['Unknown calculator'],
    };
  }

  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams);

  const overrides = {};
  const warnings = [];

  const additionalCostField = 'additionalCost';
  config.fieldOrder.forEach((field) => {
    const meta = config.fields[field];
    if (!params.has(field)) {
      overrides[field] = meta.defaultValue;
      return;
    }
    const raw = params.get(field);
    const { value, usedDefault, reason } = sanitizeNumber(raw, meta);
    overrides[field] = value;
    if (usedDefault) {
      warnings.push(`Field ${field} reverted to default (${reason})`);
    }
  });

  const theme = params.get('theme') === 'dark' ? 'dark' : 'light';
  const showNavigation =
    params.get('showNavigation') === 'true' ||
    params.get('showNavigation') === '1';

  const showAdditionalCostDefault =
    config.supportsAdditionalCostToggle && 'showAdditionalCostDefault' in config
      ? Boolean(config.showAdditionalCostDefault)
      : true;
  const showAdditionalCost = config.supportsAdditionalCostToggle
    ? normalizeBoolean(params.get('showAdditionalCost'), showAdditionalCostDefault)
    : true;

  if (
    config.supportsAdditionalCostToggle &&
    !showAdditionalCost &&
    typeof overrides[additionalCostField] === 'number'
  ) {
    const defaultAdditionalCost = config.fields[additionalCostField].defaultValue ?? 0;
    if (overrides[additionalCostField] !== defaultAdditionalCost) {
      warnings.push(
        'Additional cost override ignored because the field is hidden in this embed',
      );
    }
    overrides[additionalCostField] = defaultAdditionalCost;
  }

  return { overrides, theme, showNavigation, showAdditionalCost, warnings };
}
