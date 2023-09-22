import TextLegacyPageObject from '../pages/TextLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Text Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await TextLegacyPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Text Legacy test page', async () => {
    expect(await TextLegacyPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
