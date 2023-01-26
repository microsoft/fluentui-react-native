import LinkLegacyPageObject from '../pages/LinkLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Link Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await LinkLegacyPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Link Legacy test page', async () => {
    await LinkLegacyPageObject.navigateToPageAndLoadTests();
  });
});
