import ColorTokenPageObject from '../pages/ColorTokensPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('Color Tokens Testing Initialization', function () {
  it('Wait for app load', async () => {
    await ColorTokenPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Color Tokens test page', async () => {
    await ColorTokenPageObject.navigateToPageAndLoadTests();
  });
});
