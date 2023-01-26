import TabsLegacyPageObject from '../pages/TabsLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await TabsLegacyPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Tabs Legacy test page', async () => {
    await TabsLegacyPageObject.navigateToPageAndLoadTests();
  });
});
