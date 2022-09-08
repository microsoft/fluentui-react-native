import NavigateAppPage from '../../common/NavigateAppPage.win';
import FocusZonePageObject from '../pages/FocusZonePageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('FocusZone Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to FocusZone test page', async () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    await FocusZonePageObject.scrollToComponentButton();
    await FocusZonePageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToFocusZonePage();
    await FocusZonePageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await FocusZonePageObject.isPageLoaded()).toBeTruthy(FocusZonePageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await FocusZonePageObject.didAssertPopup()).toBeFalsy(FocusZonePageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
