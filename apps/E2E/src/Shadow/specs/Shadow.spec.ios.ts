import ShadowPageObject from '../pages/ShadowPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Shadow Testing Initialization', () => {
  it('Wait for app load', async () => {
       expect(await ShadowPageObject.waitForInitialPageToDisplay()).toBeTruthy(ShadowPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Shadow test page', async () => {
    await ShadowPageObject.navigateToPageAndLoadTests();
    expect(await ShadowPageObject.isPageLoaded()).toBeTruthy(ShadowPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
