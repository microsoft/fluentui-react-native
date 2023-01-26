import IconLegacyPageObject from '../pages/IconLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Icon Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await IconLegacyPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Icon Legacy test page', async () => {
    await IconLegacyPageObject.navigateToPageAndLoadTests();
  });
});
