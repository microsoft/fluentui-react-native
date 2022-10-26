import NavigateAppPage from '../../common/NavigateAppPage';
import FocusTrapZonePageObject from '../pages/FocusTrapZonePageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('FocusTrapZone Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to FocusTrapZone test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToFocusTrapZonePage();
    await FocusTrapZonePageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await FocusTrapZonePageObject.isPageLoaded()).toBeTruthy(FocusTrapZonePageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await FocusTrapZonePageObject.didAssertPopup()).toBeFalsy(FocusTrapZonePageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
