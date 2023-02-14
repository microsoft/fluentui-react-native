import FocusTrapZonePageObject from '../pages/FocusTrapZonePageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('FocusTrapZone Testing Initialization', () => {
  it('Wait for app load', async () => {
    await FocusTrapZonePageObject.waitForInitialPageToDisplay();
    expect(await FocusTrapZonePageObject.isInitialPageDisplayed()).toBeTruthy(FocusTrapZonePageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to FocusTrapZone test page', async () => {
    /* Click on component button to navigate to test page */
    await FocusTrapZonePageObject.navigateToPageAndLoadTests();
    expect(await FocusTrapZonePageObject.isPageLoaded()).toBeTruthy(FocusTrapZonePageObject.ERRORMESSAGE_PAGELOAD);

    await expect(await FocusTrapZonePageObject.didAssertPopup()).toBeFalsy(FocusTrapZonePageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
