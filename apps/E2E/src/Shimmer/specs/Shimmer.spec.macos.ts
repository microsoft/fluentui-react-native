import ShimmerPageObject from '../pages/ShimmerPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Shimmer Testing Initialization', function () {
  it('Wait for app load', async () => {
    await ShimmerPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Shimmer test page', async () => {
    await ShimmerPageObject.navigateToPageAndLoadTests();
  });
});
