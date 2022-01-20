import NavigateAppPage from '../../common/NavigateAppPage.win';
import ThemePageObject from '../pages/ThemePageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Theme Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Theme test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ThemePageObject.scrollToComponentButton();
    ThemePageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToThemePage();
    ThemePageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ThemePageObject.isPageLoaded()).toBeTruthy();

    expect(ThemePageObject.didAssertPopup()).toBeFalsy(); // Ensure no asserts popped up
  });
});
