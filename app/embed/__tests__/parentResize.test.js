describe('triggerParentResize', () => {
  afterEach(() => {
    delete window.parentIFrame;
  });

  it('no-ops when parentIFrame missing', () => {
    const { triggerParentResize } = require('../parentResize');
    expect(() => triggerParentResize()).not.toThrow();
  });

  it('invokes parentIFrame.size when present', () => {
    window.parentIFrame = { size: jest.fn() };
    const { triggerParentResize } = require('../parentResize');
    triggerParentResize();
    expect(window.parentIFrame.size).toHaveBeenCalledTimes(1);
  });
});
