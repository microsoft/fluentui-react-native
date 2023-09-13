import IconV1PageObject from '../pages/IconV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('IconV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await IconV1PageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to IconV1 test page', async () => {
    expect(await IconV1PageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
