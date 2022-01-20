import NavigateAppPage from '../../common/NavigateAppPage.win';
import FocusTrapZonePageObject from '../pages/FocusTrapZonePageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('FocusTrapZone Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to FocusTrapZone test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    FocusTrapZonePageObject.scrollToComponentButton();
    FocusTrapZonePageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToFocusTrapZonePage();
    FocusTrapZonePageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(FocusTrapZonePageObject.isPageLoaded()).toBeTruthy();

    expect(FocusTrapZonePageObject.didAssertPopup()).toBeFalsy(); // Ensure no asserts popped up
  });
});
