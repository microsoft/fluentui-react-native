import FocusZonePageObject from '../pages/FocusZonePageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('FocusZone Testing Initialization', function () {
  it('Wait for app load', async () => {
    await FocusZonePageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to FocusTrapZone test page', async () => {
    /* Click on component button to navigate to test page */
    await FocusZonePageObject.navigateToPageAndLoadTests();

    await expect(await FocusZonePageObject.didAssertPopup()).toBeFalsy(FocusZonePageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
