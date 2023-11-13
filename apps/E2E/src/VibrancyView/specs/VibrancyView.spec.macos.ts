import VibrancyViewPageObject from '../pages/VibrancyViewPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('VibrancyView Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await VibrancyViewPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to VibrancyView test page', async () => {
    expect(await VibrancyViewPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
