import NavigateAppPage from '../../common/NavigateAppPage';
import ExperimentalTabsPageObject from '../pages/ExperimentalTabsPageObject.win';
import { BOOT_APP_TIMEOUT, PAGE_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Experimental Tabs Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Experimental Tabs test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ExperimentalTabsPageObject.scrollToComponentButton();
    ExperimentalTabsPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToExperimentalTabsPage();
    ExperimentalTabsPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ExperimentalTabsPageObject.isPageLoaded()).toBeTruthy();
  });
});