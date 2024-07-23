import MenuButtonLegacyPageObject from '../pages/MenuButtonLegacyPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('MenuButton Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await MenuButtonLegacyPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to MenuButton Legacy test page', async () => {
    expect(await MenuButtonLegacyPageObject.navigateToPageAndLoadTests()).toBeTrue();

    await expect(await MenuButtonLegacyPageObject.isPageLoaded())
      .withContext(MenuButtonLegacyPageObject.ERRORMESSAGE_PAGELOAD)
      .toBeTruthy();
  });
});
