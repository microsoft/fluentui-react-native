import SpacingTokensPageObject from '../pages/SpacingTokensPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Spacing Tokens Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await SpacingTokensPageObject.waitForInitialPageToDisplay()).toBeTruthy(SpacingTokensPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Spacing Tokens test page', async () => {
    await SpacingTokensPageObject.navigateToPageAndLoadTests();
    expect(await SpacingTokensPageObject.isPageLoaded()).toBeTruthy(SpacingTokensPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
