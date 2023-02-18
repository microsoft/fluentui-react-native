import ThemePageObject from '../pages/ThemePageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('Theme Testing Initialization', () => {
  it('Wait for app load', async () => {
    await ThemePageObject.waitForInitialPageToDisplay();
    expect(await ThemePageObject.isInitialPageDisplayed()).toBeTruthy(ThemePageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Theme test page', async () => {
    await ThemePageObject.navigateToPageAndLoadTests();
    expect(await ThemePageObject.isPageLoaded()).toBeTruthy(ThemePageObject.ERRORMESSAGE_PAGELOAD);
  });
});
