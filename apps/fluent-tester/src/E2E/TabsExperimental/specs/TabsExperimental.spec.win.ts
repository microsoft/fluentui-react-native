import NavigateAppPage from '../../common/NavigateAppPage';
import ExperimentalTabsPageObject from '../pages/ExperimentalTabsPageObject.win';
import { TAB_A11Y_ROLE, TABITEM_A11Y_ROLE, BOOT_APP_TIMEOUT, PAGE_TIMEOUT } from '../../common/consts';

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

describe('Experimental Tabs Accessibility Testing', () => {
  it("Validate Experimental Tab's accessibilityRole is correct", () => {
    ExperimentalTabsPageObject.scrollToTestElement();
    ExperimentalTabsPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ExperimentalTabsPageObject.getAccessibilityRole()).toEqual(TAB_A11Y_ROLE);
  });

  it("Validate Experimental TabItem's accessibilityRole is correct", () => {
    ExperimentalTabsPageObject.scrollToTestElement();
    ExperimentalTabsPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ExperimentalTabsPageObject.getTabItemAccesibilityRole()).toEqual(TABITEM_A11Y_ROLE);
  });
});
