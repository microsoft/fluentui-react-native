import FocusZonePageObject from '../pages/FocusZonePageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('FocusZone Testing Initialization', () => {
  it('Wait for app load', async () => {
    await FocusZonePageObject.waitForInitialPageToDisplay();
    expect(await FocusZonePageObject.isInitialPageDisplayed()).toBeTruthy(FocusZonePageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to FocusTrapZone test page', async () => {
    /* Click on component button to navigate to test page */
    await FocusZonePageObject.navigateToPageAndLoadTests();
    expect(await FocusZonePageObject.isPageLoaded()).toBeTruthy(FocusZonePageObject.ERRORMESSAGE_PAGELOAD);
  });
});
