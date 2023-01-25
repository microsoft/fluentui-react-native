import ButtonLegacyPageObject from '../pages/ButtonLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await ButtonLegacyPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Button Legacy test page', async () => {
    await ButtonLegacyPageObject.navigateToPageAndLoadTests();

    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});
