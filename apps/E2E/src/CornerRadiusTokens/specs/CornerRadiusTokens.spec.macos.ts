import CornerRadiusTokensPageObject from '../pages/CornerRadiusTokensPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('CornerRadiusTokens Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await CornerRadiusTokensPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to CornerRadiusTokens test page', async () => {
    expect(await CornerRadiusTokensPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
