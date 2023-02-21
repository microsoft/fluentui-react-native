import TextLegacyPageObject from '../pages/TextLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Text Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    await TextLegacyPageObject.waitForInitialPageToDisplay();
    expect(await TextLegacyPageObject.isInitialPageDisplayed()).toBeTruthy(TextLegacyPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Text Legacy test page', async () => {
    await TextLegacyPageObject.navigateToPageAndLoadTests();
    expect(await TextLegacyPageObject.isPageLoaded()).toBeTruthy(TextLegacyPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
