import NavigateAppPage from '../../common/NavigateAppPage.win';
import ActivityIndicatorPageObject from '../pages/ActivityIndicatorPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Activity Indicator Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Activity Indicator test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ActivityIndicatorPageObject.scrollToComponentButton();
    ActivityIndicatorPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToActivityIndicatorPage();
    ActivityIndicatorPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ActivityIndicatorPageObject.isPageLoaded()).toBeTruthy(ActivityIndicatorPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
