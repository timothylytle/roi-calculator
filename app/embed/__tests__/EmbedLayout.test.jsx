import { render, screen } from '@testing-library/react';

jest.mock('../IframeResizerChild', () => function MockChild() {
  return <div data-testid="iframe-resizer-child" />;
});

describe('Embed layout', () => {
  it('renders iframe-resizer child and passes through children', () => {
    const children = <div>Embed content</div>;
    const Layout = require('../layout').default;
    const { getByText } = render(<Layout>{children}</Layout>);
    expect(screen.getByTestId('iframe-resizer-child')).toBeInTheDocument();
    expect(getByText('Embed content')).toBeInTheDocument();
  });
});
