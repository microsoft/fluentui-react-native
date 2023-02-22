import ColorTokenPageObject from '../pages/ColorTokensPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('Color Tokens Testing Initialization', () => {
  it('Wait for app load', async () => {
    await ColorTokenPageObject.waitForInitialPageToDisplay();
    expect(await ColorTokenPageObject.isInitialPageDisplayed()).toBeTruthy(ColorTokenPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Color Tokens test page', async () => {
    await ColorTokenPageObject.navigateToPageAndLoadTests();
    expect(await ColorTokenPageObject.isPageLoaded()).toBeTruthy(ColorTokenPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
