import { render, screen, within } from '@testing-library/react';
import CXCalculator from '../CXCalculator';

jest.mock('recharts', () => {
  const React = require('react');
  const DivContainer = ({ children }) => <div>{children}</div>;
  const SvgContainer = ({ children }) => <svg>{children}</svg>;
  const Leaf = () => <g />;
  return {
    ResponsiveContainer: DivContainer,
    LineChart: SvgContainer,
    ComposedChart: SvgContainer,
    Area: SvgContainer,
    Line: Leaf,
    XAxis: Leaf,
    YAxis: Leaf,
    CartesianGrid: Leaf,
    Tooltip: Leaf,
    ReferenceLine: Leaf,
  };
});

const BASE_OVERRIDES = {
  pricePerAgent: 1,
  agentsUsingPlatform: 1,
  activeCustomers: 100,
  churnRate: 10,
  avgRevenuePerCustomer: 1000,
  grossMargin: 50,
  additionalCost: 100,
};

function renderCalculator(props = {}) {
  return render(
    <CXCalculator
      embedOverrides={BASE_OVERRIDES}
      embedTheme="light"
      isEmbed
      {...props}
    />,
  );
}

describe('CXCalculator embed additional cost toggle', () => {
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
