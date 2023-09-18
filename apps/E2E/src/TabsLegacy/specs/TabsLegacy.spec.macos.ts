import TabsLegacyPageObject from '../pages/TabsLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await TabsLegacyPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Tabs Legacy test page', async () => {
    expect(await TabsLegacyPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
