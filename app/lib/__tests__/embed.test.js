import {
  buildEmbedUrl,
  getCalculatorDefaults,
  parseEmbedParams,
} from '@/app/lib/embed';

describe('embed helpers', () => {
  const defaultValues = getCalculatorDefaults('revenue');

  it('omits showAdditionalCost query param when flag is false', () => {
    const url = buildEmbedUrl('revenue', defaultValues, 'light', false);
    const search = url.split('?')[1] ?? '';
    const params = new URLSearchParams(search);

    expect(params.has('showAdditionalCost')).toBe(false);
  });

  it('serializes showAdditionalCost=true when requested', () => {
    const url = buildEmbedUrl('revenue', defaultValues, 'light', false, {
      showAdditionalCost: true,
    });
    const search = url.split('?')[1] ?? '';
    const params = new URLSearchParams(search);

    expect(params.get('showAdditionalCost')).toBe('true');
  });

  it('defaults showAdditionalCost to false in parsing', () => {
    const parsed = parseEmbedParams('', 'revenue');
    expect(parsed.showAdditionalCost).toBe(false);
  });

  it('respects showAdditionalCost=true in params', () => {
    const parsed = parseEmbedParams('showAdditionalCost=true', 'revenue');
    expect(parsed.showAdditionalCost).toBe(true);
  });

  it('clamps additionalCost to zero when hidden and warns on overrides', () => {
    const parsed = parseEmbedParams('additionalCost=999', 'revenue');
    expect(parsed.showAdditionalCost).toBe(false);
    expect(parsed.overrides.additionalCost).toBe(0);
    expect(parsed.warnings).toContain(
      'Additional cost override ignored because the field is hidden in this embed',
    );
  });

  it('honors additionalCost overrides when field shown', () => {
    const parsed = parseEmbedParams(
      'additionalCost=500&showAdditionalCost=true',
      'revenue',
    );

    expect(parsed.showAdditionalCost).toBe(true);
    expect(parsed.overrides.additionalCost).toBe(500);
    expect(parsed.warnings).not.toContain(
      'Additional cost override ignored because the field is hidden in this embed',
    );
  });
});
