export const MIN_WIDTH = 320;
export const MIN_HEIGHT = 400;
export const MAX_DIMENSION = 2000;
export const DEFAULT_STATIC_DIMENSIONS = {
  width: 800,
  height: 740,
};

function parseDimension(value) {
  if (value === '' || value === null || value === undefined) {
    return Number.NaN;
  }
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return value;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function validateDimensions(dimensions = DEFAULT_STATIC_DIMENSIONS) {
  const numeric = { ...DEFAULT_STATIC_DIMENSIONS };
  const errors = {};

  const rawWidth = parseDimension(dimensions.width);
  if (Number.isNaN(rawWidth)) {
    errors.width = 'Enter a width in pixels';
  } else if (rawWidth < MIN_WIDTH) {
    errors.width = `Width must be at least ${MIN_WIDTH}px`;
    numeric.width = MIN_WIDTH;
  } else if (rawWidth > MAX_DIMENSION) {
    errors.width = `Width must be at most ${MAX_DIMENSION}px`;
    numeric.width = MAX_DIMENSION;
  } else {
    numeric.width = rawWidth;
  }

  const rawHeight = parseDimension(dimensions.height);
  if (Number.isNaN(rawHeight)) {
    errors.height = 'Enter a height in pixels';
  } else if (rawHeight < MIN_HEIGHT) {
    errors.height = `Height must be at least ${MIN_HEIGHT}px`;
    numeric.height = MIN_HEIGHT;
  } else if (rawHeight > MAX_DIMENSION) {
    errors.height = `Height must be at most ${MAX_DIMENSION}px`;
    numeric.height = MAX_DIMENSION;
  } else {
    numeric.height = rawHeight;
  }

  return {
    numeric,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

export function coerceDimensions(dimensions = DEFAULT_STATIC_DIMENSIONS) {
  return validateDimensions(dimensions).numeric;
}
