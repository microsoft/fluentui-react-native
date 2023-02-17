import CalloutPageObject from '../pages/CalloutPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('Callout Testing Initialization', () => {
  it('Wait for app load', async () => {
    await CalloutPageObject.waitForInitialPageToDisplay();
    expect(await CalloutPageObject.isInitialPageDisplayed()).toBeTruthy(CalloutPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Callout test page', async () => {
    await CalloutPageObject.navigateToPageAndLoadTests();
    expect(await CalloutPageObject.isPageLoaded()).toBeTruthy(CalloutPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
