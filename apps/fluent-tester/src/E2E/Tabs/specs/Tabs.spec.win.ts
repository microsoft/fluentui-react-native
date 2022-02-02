import NavigateAppPage from '../../common/NavigateAppPage.win';
import TabsPageObject, { TabItemSelector } from '../pages/TabsPageObject.win';
import { TAB_A11Y_ROLE, BOOT_APP_TIMEOUT, PAGE_TIMEOUT, TABITEM_A11Y_ROLE, Keys } from '../../common/consts';

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
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(() => {
    TabsPageObject.scrollToTestElement();
    TabsPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it("Validate Tab's accessibilityRole is correct", () => {
    expect(TabsPageObject.getAccessibilityRole()).toEqual(TAB_A11Y_ROLE);
    expect(TabsPageObject.didAssertPopup()).toBeFalsy(TabsPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Validate TabItem's accessibilityRole is correct", () => {
    expect(TabsPageObject.getTabItemAccesibilityRole(TabItemSelector.First)).toEqual(TABITEM_A11Y_ROLE);
    expect(TabsPageObject.didAssertPopup()).toBeFalsy(TabsPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Tabs Functional Tests', () => {
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(() => {
    TabsPageObject.scrollToTestElement();
    TabsPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    // Reset the TabGroup by putting focus on First tab item
    TabsPageObject.clickOnTabItem(TabItemSelector.First);
  });

  it('Click on the second tab header and validate the correct TabItem content is shown', () => {
    TabsPageObject.clickOnTabItem(TabItemSelector.Second);
    TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.Second, PAGE_TIMEOUT);

    expect(TabsPageObject.didTabItemContentLoad(TabItemSelector.Second)).toBeTruthy();
    expect(TabsPageObject.didAssertPopup()).toBeFalsy(TabsPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Keyboarding: Arrow Navigation: Right -> Down -> Left -> Up -> Validate the correct TabItem content is shown', () => {
    /* At First tab element, press Right Arrow to navigate to the Second tab element */
    TabsPageObject.sendKey(Keys.Right_Arrow, TabItemSelector.First);
    TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.Second, PAGE_TIMEOUT);

    expect(TabsPageObject.didTabItemContentLoad(TabItemSelector.Second)).toBeTruthy();

    /* At Second tab element, press Down Arrow to navigate to the Third tab element */
    TabsPageObject.sendKey(Keys.Down_Arrow, TabItemSelector.Second);
    TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.Third, PAGE_TIMEOUT);

    expect(TabsPageObject.didTabItemContentLoad(TabItemSelector.Third)).toBeTruthy();

    /* At Third tab element, press Left Arrow to navigate to the Second tab element */
    TabsPageObject.sendKey(Keys.Left_Arrow, TabItemSelector.Third);
    TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.Second, PAGE_TIMEOUT);

    expect(TabsPageObject.didTabItemContentLoad(TabItemSelector.Second)).toBeTruthy();

    /* At Second tab element, press Up Arrow to navigate to the First tab element */
    TabsPageObject.sendKey(Keys.Up_Arrow, TabItemSelector.Second);
    TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.First, PAGE_TIMEOUT);

    expect(TabsPageObject.didTabItemContentLoad(TabItemSelector.First)).toBeTruthy();
    expect(TabsPageObject.didAssertPopup()).toBeFalsy(TabsPageObject.ERRORMESSAGE_ASSERT);
  });
});
