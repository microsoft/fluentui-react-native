import ShimmerPageObject from '../pages/ShimmerPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Shimmer Testing Initialization', () => {
  it('Wait for app load', async () => {
    await ShimmerPageObject.waitForInitialPageToDisplay();
    expect(await ShimmerPageObject.isInitialPageDisplayed()).toBeTruthy(ShimmerPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Shimmer test page', async () => {
    await ShimmerPageObject.navigateToPageAndLoadTests();
    expect(await ShimmerPageObject.isPageLoaded()).toBeTruthy(ShimmerPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
