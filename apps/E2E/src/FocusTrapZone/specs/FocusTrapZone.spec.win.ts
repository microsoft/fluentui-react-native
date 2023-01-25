import FocusTrapZonePageObject from '../pages/FocusTrapZonePageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('FocusTrapZone Testing Initialization', function () {
  it('Wait for app load', async () => {
    await FocusTrapZonePageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to FocusTrapZone test page', async () => {
    /* Click on component button to navigate to test page */
    await FocusTrapZonePageObject.navigateToPageAndLoadTests();

    await expect(await FocusTrapZonePageObject.didAssertPopup()).toBeFalsy(FocusTrapZonePageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
