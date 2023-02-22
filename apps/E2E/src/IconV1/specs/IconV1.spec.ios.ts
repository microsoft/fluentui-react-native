import IconV1PageObject from '../pages/IconV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('IconV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    await IconV1PageObject.waitForInitialPageToDisplay();
    expect(await IconV1PageObject.isInitialPageDisplayed()).toBeTruthy(IconV1PageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to IconV1 test page', async () => {
    await IconV1PageObject.navigateToPageAndLoadTests();
    expect(await IconV1PageObject.isPageLoaded()).toBeTruthy(IconV1PageObject.ERRORMESSAGE_PAGELOAD);
  });
});
