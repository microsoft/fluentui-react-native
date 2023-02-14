import ActivityIndicatorPageObject from '../pages/ActivityIndicatorPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Activity Indicator Testing Initialization', () => {
  it('Wait for app load', async () => {
    await ActivityIndicatorPageObject.waitForInitialPageToDisplay();
    expect(await ActivityIndicatorPageObject.isInitialPageDisplayed()).toBeTruthy(ActivityIndicatorPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Activity Indicator test page', async () => {
    await ActivityIndicatorPageObject.navigateToPageAndLoadTests();
    expect(await ActivityIndicatorPageObject.isPageLoaded()).toBeTruthy(ActivityIndicatorPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
