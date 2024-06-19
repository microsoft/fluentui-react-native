import StrokeWidthTokensPageObject from '../pages/StrokeWidthTokensPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Stroke Width Token Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await StrokeWidthTokensPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Stroke Width Tokens test page', async () => {
    expect(await StrokeWidthTokensPageObject.navigateToPageAndLoadTests()).toBeTrue();

    await expect(await StrokeWidthTokensPageObject.didAssertPopup())
      .withContext(StrokeWidthTokensPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy(); // Ensure no asserts popped up
  });
});
