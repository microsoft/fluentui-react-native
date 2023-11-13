import ColorTokenPageObject from '../pages/ColorTokensPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('Color Tokens Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await ColorTokenPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Color Tokens test page', async () => {
    expect(await ColorTokenPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
