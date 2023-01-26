import ActivityIndicatorPageObject from '../pages/ActivityIndicatorPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Activity Indicator Testing Initialization', function () {
  it('Wait for app load', async () => {
    await ActivityIndicatorPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Activity Indicator test page', async () => {
    await ActivityIndicatorPageObject.navigateToPageAndLoadTests();
  });
});
