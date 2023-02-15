import DividerPageObject from '../pages/DividerPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Divider Testing Initialization', () => {
  it('Wait for app load', async () => {
    await DividerPageObject.waitForInitialPageToDisplay();
    expect(await DividerPageObject.isInitialPageDisplayed()).toBeTruthy(DividerPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Divider test page', async () => {
    /* Click on component button to navigate to test page */
    await DividerPageObject.navigateToPageAndLoadTests();
    expect(await DividerPageObject.isPageLoaded()).toBeTruthy(DividerPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
