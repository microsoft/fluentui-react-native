import SvgPageObject from '../pages/SvgPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Svg Testing Initialization', () => {
  it('Wait for app load', async () => {
    await SvgPageObject.waitForInitialPageToDisplay();
    expect(await SvgPageObject.isInitialPageDisplayed()).toBeTruthy(SvgPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Svg test page', async () => {
    await SvgPageObject.navigateToPageAndLoadTests();
    expect(await SvgPageObject.isPageLoaded()).toBeTruthy(SvgPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
