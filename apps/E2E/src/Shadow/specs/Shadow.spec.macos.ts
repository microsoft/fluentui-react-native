import ShadowPageObject from '../pages/ShadowPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Shadow Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await ShadowPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Shadow test page', async () => {
    expect(await ShadowPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
