import '@testing-library/jest-dom';

beforeEach(() => {
  if (typeof navigator !== 'undefined') {
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
        configurable: true,
      });
    } else if (!navigator.clipboard.writeText) {
      navigator.clipboard.writeText = jest.fn().mockResolvedValue(undefined);
    } else {
      navigator.clipboard.writeText = jest
        .fn()
        .mockResolvedValue(undefined);
    }
  }
});
