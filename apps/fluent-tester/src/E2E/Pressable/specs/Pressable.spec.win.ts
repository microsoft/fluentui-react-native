import NavigateAppPage from '../../common/NavigateAppPage';
import PressablePageObject from '../pages/PressablePageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Pressable Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Pressable test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    PressablePageObject.scrollToComponentButton();
    PressablePageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToPressablePage();
    PressablePageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(PressablePageObject.isPageLoaded()).toBeTruthy();
  });
});
