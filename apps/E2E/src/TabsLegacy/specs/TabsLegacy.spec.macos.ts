import TabsLegacyPageObject from '../pages/TabsLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    await TabsLegacyPageObject.waitForInitialPageToDisplay();
    expect(await TabsLegacyPageObject.isInitialPageDisplayed()).toBeTruthy(TabsLegacyPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Tabs Legacy test page', async () => {
    await TabsLegacyPageObject.navigateToPageAndLoadTests();
    expect(await TabsLegacyPageObject.isPageLoaded()).toBeTruthy(TabsLegacyPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
