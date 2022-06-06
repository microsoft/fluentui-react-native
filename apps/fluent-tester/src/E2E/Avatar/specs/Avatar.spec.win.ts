import NavigateAppPage from '../../common/NavigateAppPage.win';
import AvatarPageObject from '../pages/AvatarPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Avatar Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Avatar test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    AvatarPageObject.scrollToComponentButton();
    AvatarPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToAvatarPage();
    AvatarPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(AvatarPageObject.isPageLoaded()).toBeTruthy(AvatarPageObject.ERRORMESSAGE_PAGELOAD);
    expect(AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });
});
