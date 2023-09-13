import TabsV1PageObject from '../pages/TabsV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('TabsV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await TabsV1PageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to TabsV1 test page', async () => {
    expect(await TabsV1PageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
