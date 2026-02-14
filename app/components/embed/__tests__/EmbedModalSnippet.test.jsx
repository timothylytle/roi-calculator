import { fireEvent, render, screen } from '@testing-library/react';
import EmbedModal from '../EmbedModal';

jest.mock('../../ROICalculator', () => function MockROI() {
  return <div data-testid="roi-calculator" />;
});

jest.mock('../../CXCalculator', () => function MockCX() {
  return <div data-testid="cx-calculator" />;
});

jest.mock('../../Navigation', () => function MockNavigation() {
  return <div data-testid="navigation" />;
});

describe('EmbedModal snippet output', () => {
  it('generates responsive snippet with wrapper by default', () => {
    render(<EmbedModal calculatorType="revenue" initialValues={{}} onClose={jest.fn()} />);

    const textarea = screen.getByLabelText(/generated iframe code/i);
    const snippet = textarea.value;
    expect(snippet).toContain('<div class="hs-responsive-embed">');
    expect(snippet).toContain('<div class="hs-responsive-embed__wrapper">');
    expect(snippet).toContain('width="100%" height="100%"');
  });

  it('switches to static snippet with explicit dimensions', () => {
    render(<EmbedModal calculatorType="revenue" initialValues={{}} onClose={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /static dimensions/i }));
    fireEvent.change(screen.getByLabelText(/width \(px\)/i), {
      target: { value: '900' },
    });
    fireEvent.change(screen.getByLabelText(/height \(px\)/i), {
      target: { value: '880' },
    });

    const textarea = screen.getByLabelText(/generated iframe code/i);
    const snippet = textarea.value;
    expect(snippet.trim().startsWith('<iframe')).toBe(true);
    expect(snippet).toContain('width="900"');
    expect(snippet).toContain('height="880"');
    expect(snippet).not.toContain('hs-responsive-embed');
  });

  it('appends iframe-resizer scripts when toggle enabled', () => {
    render(<EmbedModal calculatorType="revenue" initialValues={{}} onClose={jest.fn()} />);

    fireEvent.click(screen.getByLabelText(/include iframe-resizer parent script/i));
    const snippet = screen.getByLabelText(/generated iframe code/i).value;
    expect(snippet).toContain('iframeResizer.min.js');
    expect(snippet).toContain("iFrameResize({ checkOrigin: false }");
  });
});
