import MenuPageObject from '../pages/MenuPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Menu Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await MenuPageObject.waitForInitialPageToDisplay()).toBeTruthy(MenuPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Menu test page', async () => {
    /* Click on component button to navigate to test page */
    await MenuPageObject.navigateToPageAndLoadTests();
    expect(await MenuPageObject.isPageLoaded()).toBeTruthy(MenuPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
