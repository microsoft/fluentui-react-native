import SeparatorPageObject from '../pages/SeparatorPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Separator Testing Initialization', () => {
  it('Wait for app load', async () => {
    await SeparatorPageObject.waitForInitialPageToDisplay();
    expect(await SeparatorPageObject.isInitialPageDisplayed()).toBeTruthy(SeparatorPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Separator test page', async () => {
    await SeparatorPageObject.navigateToPageAndLoadTests();
    expect(await SeparatorPageObject.isPageLoaded()).toBeTruthy(SeparatorPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
