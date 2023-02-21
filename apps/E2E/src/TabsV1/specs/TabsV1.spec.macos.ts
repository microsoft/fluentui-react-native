import TabsV1PageObject from '../pages/TabsV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('TabsV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    await TabsV1PageObject.waitForInitialPageToDisplay();
    expect(await TabsV1PageObject.isInitialPageDisplayed()).toBeTruthy(TabsV1PageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to TabsV1 test page', async () => {
    await TabsV1PageObject.navigateToPageAndLoadTests();
    expect(await TabsV1PageObject.isPageLoaded()).toBeTruthy(TabsV1PageObject.ERRORMESSAGE_PAGELOAD);
  });
});
