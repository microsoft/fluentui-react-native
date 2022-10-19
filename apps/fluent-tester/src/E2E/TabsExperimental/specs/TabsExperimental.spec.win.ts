import NavigateAppPage from '../../common/NavigateAppPage';
import ExperimentalTabsPageObject from '../pages/ExperimentalTabsPageObject';
import { TAB_A11Y_ROLE, TABITEM_A11Y_ROLE, BOOT_APP_TIMEOUT, PAGE_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Experimental Tabs Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Experimental Tabs test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToExperimentalTabsPage();
    await ExperimentalTabsPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalTabsPageObject.isPageLoaded()).toBeTruthy(ExperimentalTabsPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ExperimentalTabsPageObject.didAssertPopup()).toBeFalsy(ExperimentalTabsPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Experimental Tabs Accessibility Testing', () => {
  it("Validate Experimental Tab's accessibilityRole is correct", async () => {
    await ExperimentalTabsPageObject.scrollToTestElement();
    await ExperimentalTabsPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalTabsPageObject.getAccessibilityRole()).toEqual(TAB_A11Y_ROLE);
    await expect(await ExperimentalTabsPageObject.didAssertPopup()).toBeFalsy(ExperimentalTabsPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Validate Experimental TabItem's accessibilityRole is correct", async () => {
    await ExperimentalTabsPageObject.scrollToTestElement();
    await ExperimentalTabsPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalTabsPageObject.getTabItemAccesibilityRole()).toEqual(TABITEM_A11Y_ROLE);
    await expect(await ExperimentalTabsPageObject.didAssertPopup()).toBeFalsy(ExperimentalTabsPageObject.ERRORMESSAGE_ASSERT);
  });
});
