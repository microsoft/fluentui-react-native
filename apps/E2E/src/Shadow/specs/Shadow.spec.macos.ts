import ShadowPageObject from '../pages/ShadowPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Shadow Testing Initialization', function () {
  it('Wait for app load', async () => {
    await ShadowPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Shadow test page', async () => {
    await ShadowPageObject.navigateToPageAndLoadTests();

    await expect(await ShadowPageObject.didAssertPopup()).toBeFalsy(ShadowPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
