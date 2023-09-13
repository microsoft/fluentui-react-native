import SeparatorPageObject from '../pages/SeparatorPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Separator Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await SeparatorPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Separator test page', async () => {
    expect(await SeparatorPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
