import ShimmerPageObject from '../pages/ShimmerPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Shimmer Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await ShimmerPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Shimmer test page', async () => {
    expect(await ShimmerPageObject.navigateToPageAndLoadTests()).toBeTrue();

    await expect(await ShimmerPageObject.didAssertPopup()).toBeFalsy(ShimmerPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
