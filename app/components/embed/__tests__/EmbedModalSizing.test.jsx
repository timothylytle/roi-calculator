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

describe('EmbedModal sizing controls', () => {
  test('defaults to responsive mode with responsive preview', () => {
    render(<EmbedModal calculatorType="revenue" initialValues={{}} onClose={jest.fn()} />);

    const responsiveButton = screen.getByRole('button', {
      name: /responsive \(recommended\)/i,
    });
    expect(responsiveButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText(/responsive preview/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/static preview/i)).not.toBeInTheDocument();
  });

  test('static mode reveals inputs and enforces validation errors', () => {
    render(<EmbedModal calculatorType="revenue" initialValues={{}} onClose={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /static dimensions/i }));
    const widthInput = screen.getByLabelText(/width \(px\)/i);
    fireEvent.change(widthInput, { target: { value: '100' } });
    const heightInput = screen.getByLabelText(/height \(px\)/i);
    fireEvent.change(heightInput, { target: { value: '200' } });

    expect(screen.getByText(/width must be at least/i)).toBeInTheDocument();
    expect(screen.getByText(/height must be at least/i)).toBeInTheDocument();

    const copyButton = screen.getByRole('button', { name: /copy iframe code/i });
    expect(copyButton).toBeDisabled();
    expect(screen.getByLabelText(/static preview/i)).toBeInTheDocument();
  });
});
