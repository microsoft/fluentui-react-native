import StrokeWidthTokensPageObject from '../pages/StrokeWidthTokensPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Stroke Width Tokens Testing Initialization', function () {
  it('Wait for app load', async () => {
    await StrokeWidthTokensPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Stroke Width Tokens test page', async () => {
    await StrokeWidthTokensPageObject.navigateToPageAndLoadTests();

    await expect(await StrokeWidthTokensPageObject.didAssertPopup()).toBeFalsy(StrokeWidthTokensPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
