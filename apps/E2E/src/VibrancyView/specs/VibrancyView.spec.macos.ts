import VibrancyViewPageObject from '../pages/VibrancyViewPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('VibrancyView Testing Initialization', () => {
  it('Wait for app load', async () => {
    await VibrancyViewPageObject.waitForInitialPageToDisplay();
    expect(await VibrancyViewPageObject.isInitialPageDisplayed()).toBeTruthy(VibrancyViewPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to VibrancyView test page', async () => {
    await VibrancyViewPageObject.navigateToPageAndLoadTests();
    expect(await VibrancyViewPageObject.isPageLoaded()).toBeTruthy(VibrancyViewPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
