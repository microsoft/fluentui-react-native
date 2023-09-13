import ButtonLegacyPageObject from '../pages/ButtonLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await ButtonLegacyPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Button Legacy test page', async () => {
    expect(await ButtonLegacyPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
