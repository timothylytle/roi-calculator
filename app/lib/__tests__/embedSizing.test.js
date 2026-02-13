import {
  DEFAULT_STATIC_DIMENSIONS,
  MIN_HEIGHT,
  MIN_WIDTH,
  MAX_DIMENSION,
  coerceDimensions,
  validateDimensions,
} from '@/app/lib/embedSizing';

describe('validateDimensions', () => {
  it('returns defaults when values are valid', () => {
    const result = validateDimensions({ width: 900, height: 820 });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.numeric).toEqual({ width: 900, height: 820 });
  });

  it('flags values below the minimums', () => {
    const result = validateDimensions({ width: 100, height: 200 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      width: `Width must be at least ${MIN_WIDTH}px`,
      height: `Height must be at least ${MIN_HEIGHT}px`,
    });
    expect(result.numeric).toEqual({ width: MIN_WIDTH, height: MIN_HEIGHT });
  });

  it('flags values above the maximum', () => {
    const result = validateDimensions({ width: 4000, height: 5000 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      width: `Width must be at most ${MAX_DIMENSION}px`,
      height: `Height must be at most ${MAX_DIMENSION}px`,
    });
    expect(result.numeric).toEqual({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
    });
  });

  it('requires numeric input', () => {
    const result = validateDimensions({ width: '', height: 'abc' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      width: 'Enter a width in pixels',
      height: 'Enter a height in pixels',
    });
    expect(result.numeric).toEqual(DEFAULT_STATIC_DIMENSIONS);
  });
});

describe('coerceDimensions', () => {
  it('returns numeric defaults when values invalid', () => {
    expect(coerceDimensions({ width: null, height: null })).toEqual(
      DEFAULT_STATIC_DIMENSIONS,
    );
  });
});
