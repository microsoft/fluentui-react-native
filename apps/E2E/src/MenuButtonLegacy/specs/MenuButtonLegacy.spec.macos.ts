import MenuButtonLegacyPageObject from '../pages/MenuButtonLegacyPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('MenuButton Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await MenuButtonLegacyPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to MenuButton Legacy test page', async () => {
    await MenuButtonLegacyPageObject.navigateToPageAndLoadTests();

    await expect(await MenuButtonLegacyPageObject.isPageLoaded()).toBeTruthy(MenuButtonLegacyPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
