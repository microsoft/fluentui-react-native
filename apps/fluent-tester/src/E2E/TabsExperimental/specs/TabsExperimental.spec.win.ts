import NavigateAppPage from '../../common/NavigateAppPage.win';
import ExperimentalTabsPageObject from '../pages/ExperimentalTabsPageObject.win';
import { TAB_A11Y_ROLE, TABITEM_A11Y_ROLE, BOOT_APP_TIMEOUT, PAGE_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Experimental Tabs Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Experimental Tabs test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ExperimentalTabsPageObject.scrollToComponentButton();
    ExperimentalTabsPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToExperimentalTabsPage();
    ExperimentalTabsPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ExperimentalTabsPageObject.isPageLoaded()).toBeTruthy(ExperimentalTabsPageObject.ERRORMESSAGE_PAGELOAD);
    expect(ExperimentalTabsPageObject.didAssertPopup()).toBeFalsy(ExperimentalTabsPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Experimental Tabs Accessibility Testing', () => {
  it("Validate Experimental Tab's accessibilityRole is correct", () => {
    ExperimentalTabsPageObject.scrollToTestElement();
    ExperimentalTabsPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    expect(ExperimentalTabsPageObject.getAccessibilityRole()).toEqual(TAB_A11Y_ROLE);
    expect(ExperimentalTabsPageObject.didAssertPopup()).toBeFalsy(ExperimentalTabsPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Validate Experimental TabItem's accessibilityRole is correct", () => {
    ExperimentalTabsPageObject.scrollToTestElement();
    ExperimentalTabsPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    expect(ExperimentalTabsPageObject.getTabItemAccesibilityRole()).toEqual(TABITEM_A11Y_ROLE);
    expect(ExperimentalTabsPageObject.didAssertPopup()).toBeFalsy(ExperimentalTabsPageObject.ERRORMESSAGE_ASSERT);
  });
});
