import LinkLegacyPageObject from '../pages/LinkLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Link Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await LinkLegacyPageObject.waitForInitialPageToDisplay()).toBeTruthy(LinkLegacyPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Link Legacy test page', async () => {
    await LinkLegacyPageObject.navigateToPageAndLoadTests();
    expect(await LinkLegacyPageObject.isPageLoaded()).toBeTruthy(LinkLegacyPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
