import IconLegacyPageObject from '../pages/IconLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Icon Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    await IconLegacyPageObject.waitForInitialPageToDisplay();
    expect(await IconLegacyPageObject.isInitialPageDisplayed()).toBeTruthy(IconLegacyPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Icon Legacy test page', async () => {
    await IconLegacyPageObject.navigateToPageAndLoadTests();
    expect(await IconLegacyPageObject.isPageLoaded()).toBeTruthy(IconLegacyPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
