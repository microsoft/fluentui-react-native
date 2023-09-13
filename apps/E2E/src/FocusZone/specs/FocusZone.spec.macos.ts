import FocusZonePageObject from '../pages/FocusZonePageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('FocusZone Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await FocusZonePageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to FocusTrapZone test page', async () => {
    /* Click on component button to navigate to test page */
    expect(await FocusZonePageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
