import { render, screen, within } from '@testing-library/react';
import ROICalculator from '../ROICalculator';

jest.mock('recharts', () => {
  const React = require('react');
  const DivContainer = ({ children }) => <div>{children}</div>;
  const SvgContainer = ({ children }) => <svg>{children}</svg>;
  const Leaf = () => <g />;
  return {
    ResponsiveContainer: DivContainer,
    LineChart: SvgContainer,
    ComposedChart: SvgContainer,
    BarChart: SvgContainer,
    Area: SvgContainer,
    Line: Leaf,
    XAxis: Leaf,
    YAxis: Leaf,
    CartesianGrid: Leaf,
    Tooltip: Leaf,
    ReferenceLine: Leaf,
    Bar: Leaf,
  };
});

const BASE_OVERRIDES = {
  pricePerAgent: 1,
  salesAgents: 1,
  leadsPerMonth: 100,
  closeRate: 5,
  avgDealValue: 1000,
  additionalCost: 100,
};

function renderCalculator(props = {}) {
  return render(
    <ROICalculator
      embedOverrides={BASE_OVERRIDES}
      embedTheme="light"
      isEmbed
      {...props}
    />,
  );
}

describe('ROICalculator embed additional cost toggle', () => {
  it('shows Additional cost input when enabled', () => {
    renderCalculator({ additionalCostEnabled: true });
    expect(screen.getByText('Additional cost')).toBeInTheDocument();
  });

  it('hides Additional cost input when disabled', () => {
    renderCalculator({ additionalCostEnabled: false });
    expect(screen.queryByText('Additional cost')).not.toBeInTheDocument();
  });

  it('clamps annual investment to omit additional cost when disabled', () => {
    renderCalculator({ additionalCostEnabled: false });
    const label = screen.getAllByText(/Annual investment/i)[0];
    const row = label.parentElement;
    expect(within(row).getByText('$12')).toBeInTheDocument();
  });

  it('includes additional cost in annual investment when enabled', () => {
    renderCalculator({ additionalCostEnabled: true });
    const label = screen.getAllByText(/Annual investment/i)[0];
    const row = label.parentElement;
    expect(within(row).getByText('$112')).toBeInTheDocument();
  });
});
