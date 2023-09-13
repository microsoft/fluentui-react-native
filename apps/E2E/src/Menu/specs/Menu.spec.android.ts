import MenuPageObject from '../pages/MenuPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Menu Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await MenuPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Menu test page', async () => {
    /* Click on component button to navigate to test page */
    expect(await MenuPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
