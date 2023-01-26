import TextLegacyPageObject from '../pages/TextLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Text Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await TextLegacyPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Text Legacy test page', async () => {
    await TextLegacyPageObject.navigateToPageAndLoadTests();

    await expect(await TextLegacyPageObject.didAssertPopup()).toBeFalsy(TextLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
