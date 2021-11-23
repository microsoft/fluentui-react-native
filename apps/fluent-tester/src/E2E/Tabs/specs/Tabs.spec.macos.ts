import NavigateAppPage from '../../common/NavigateAppPage';
import TabsPageObject from '../pages/TabsPageObject.win';
import { BOOT_APP_TIMEOUT, PAGE_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Tabs test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    TabsPageObject.scrollToComponentButton();
    TabsPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToTabsPage();
    TabsPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(TabsPageObject.isPageLoaded()).toBeTruthy();
  });
});