import { render, waitFor } from '@testing-library/react';

jest.mock('iframe-resizer/js/iframeResizer.contentWindow', () => ({}), {
  virtual: true,
});

describe('IframeResizerChild', () => {
  const originalWarn = console.warn;

  beforeEach(() => {
    console.warn = jest.fn();
    delete window.parentIFrame;
  });

  afterEach(() => {
    console.warn = originalWarn;
  });

  it('warns when parentIFrame is missing', async () => {
    const Component = require('../IframeResizerChild').default;
    render(<Component />);
    await waitFor(() => {
      expect(console.warn).toHaveBeenCalledWith(
        '[embed] parentIFrame not detected; iframe may not resize',
      );
    });
  });
});
