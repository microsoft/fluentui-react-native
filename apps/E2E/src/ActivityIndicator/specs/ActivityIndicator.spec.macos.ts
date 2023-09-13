import ActivityIndicatorPageObject from '../pages/ActivityIndicatorPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Activity Indicator Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await ActivityIndicatorPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Activity Indicator test page', async () => {
    expect(await ActivityIndicatorPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
