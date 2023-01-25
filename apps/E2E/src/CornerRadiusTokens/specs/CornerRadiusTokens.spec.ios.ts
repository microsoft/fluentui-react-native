import CornerRadiusTokensPageObject from '../pages/CornerRadiusTokensPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('CornerRadiusTokens Testing Initialization', function () {
  it('Wait for app load', async () => {
    await CornerRadiusTokensPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to CornerRadiusTokens test page', async () => {
    await CornerRadiusTokensPageObject.navigateToPageAndLoadTests();

    await expect(await CornerRadiusTokensPageObject.didAssertPopup()).toBeFalsy(CornerRadiusTokensPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
