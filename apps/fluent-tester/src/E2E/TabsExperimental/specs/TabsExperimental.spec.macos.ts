import NavigateAppPage from '../../common/NavigateAppPage.macos';
import ExperimentalTabsPageObject from '../pages/ExperimentalTabsPageObject.macos';
import { BOOT_APP_TIMEOUT, PAGE_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Experimental Tabs Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Experimental Tabs test page', async () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    await ExperimentalTabsPageObject.scrollToComponentButton();
    await ExperimentalTabsPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToExperimentalTabsPage();
    await ExperimentalTabsPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalTabsPageObject.isPageLoaded()).toBeTruthy();
  });
});
