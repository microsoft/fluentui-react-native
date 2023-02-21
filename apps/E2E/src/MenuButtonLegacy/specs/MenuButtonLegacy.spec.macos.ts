import MenuButtonLegacyPageObject from '../pages/MenuButtonLegacyPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('MenuButton Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    await MenuButtonLegacyPageObject.waitForInitialPageToDisplay();
    expect(await MenuButtonLegacyPageObject.isInitialPageDisplayed()).toBeTruthy(MenuButtonLegacyPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to MenuButton Legacy test page', async () => {
    await MenuButtonLegacyPageObject.navigateToPageAndLoadTests();
    expect(await MenuButtonLegacyPageObject.isPageLoaded()).toBeTruthy(MenuButtonLegacyPageObject.ERRORMESSAGE_PAGELOAD);

    await expect(await MenuButtonLegacyPageObject.isPageLoaded()).toBeTruthy(MenuButtonLegacyPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
