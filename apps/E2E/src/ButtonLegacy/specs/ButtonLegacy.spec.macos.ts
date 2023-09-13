import ButtonLegacyPageObject from '../pages/ButtonLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await ButtonLegacyPageObject.waitForInitialPageToDisplay()).toBeTruthy(ButtonLegacyPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Button Legacy test page', async () => {
    await ButtonLegacyPageObject.navigateToPageAndLoadTests();
    expect(await ButtonLegacyPageObject.isPageLoaded()).toBeTruthy(ButtonLegacyPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
