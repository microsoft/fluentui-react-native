import CornerRadiusTokensPageObject from '../pages/CornerRadiusTokensPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('CornerRadiusTokens Testing Initialization', () => {
  it('Wait for app load', async () => {
    await CornerRadiusTokensPageObject.waitForInitialPageToDisplay();
    expect(await CornerRadiusTokensPageObject.isInitialPageDisplayed()).toBeTruthy(CornerRadiusTokensPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to CornerRadiusTokens test page', async () => {
    await CornerRadiusTokensPageObject.navigateToPageAndLoadTests();
    expect(await CornerRadiusTokensPageObject.isPageLoaded()).toBeTruthy(CornerRadiusTokensPageObject.ERRORMESSAGE_PAGELOAD);

    await expect(await CornerRadiusTokensPageObject.didAssertPopup()).toBeFalsy(CornerRadiusTokensPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
