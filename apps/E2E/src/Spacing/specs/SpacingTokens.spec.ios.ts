import SpacingTokensPageObject from '../pages/SpacingTokensPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Spacing Tokens Testing Initialization', function () {
  it('Wait for app load', async () => {
    await SpacingTokensPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Spacing Tokens test page', async () => {
    await SpacingTokensPageObject.navigateToPageAndLoadTests();
  });
});
