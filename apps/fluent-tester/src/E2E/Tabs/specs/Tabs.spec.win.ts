import NavigateAppPage from '../../common/NavigateAppPage.win';
import TabsPageObject from '../pages/TabsPageObject.win';
import { TAB_A11Y_ROLE, BOOT_APP_TIMEOUT, PAGE_TIMEOUT, TABITEM_A11Y_ROLE } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Tabs test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    TabsPageObject.scrollToComponentButton();
    TabsPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToTabsPage();
    TabsPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(TabsPageObject.isPageLoaded()).toBeTruthy(TabsPageObject.ERRORMESSAGE_PAGELOAD);

    expect(TabsPageObject.didAssertPopup()).toBeFalsy(TabsPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Tabs Accessibility Testing', () => {
  it("Validate Tab's accessibilityRole is correct", () => {
    TabsPageObject.scrollToTestElement();
    TabsPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(TabsPageObject.getAccessibilityRole()).toEqual(TAB_A11Y_ROLE);
  });

  it("Validate TabItem's accessibilityRole is correct", () => {
    TabsPageObject.scrollToTestElement();
    TabsPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(TabsPageObject.getTabItemAccesibilityRole()).toEqual(TABITEM_A11Y_ROLE);
  });
});
