import NavigateAppPage from '../../common/NavigateAppPage';
import TabsLegacyPageObject, { TabItem } from '../pages/TabsLegacyPageObject';
import { TAB_A11Y_ROLE, BOOT_APP_TIMEOUT, PAGE_TIMEOUT, TABITEM_A11Y_ROLE, Attribute } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Tabs Legacy test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTabsLegacyPage();
    await TabsLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TabsLegacyPageObject.isPageLoaded()).toBeTruthy(TabsLegacyPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Tabs Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(async () => {
    await TabsLegacyPageObject.scrollToTestElement();
  });

  it('Validate Tab\'s "accessibilityRole" defaults to "ControlType.Tab".', async () => {
    await expect(
      await TabsLegacyPageObject.compareAttribute(TabsLegacyPageObject._primaryComponent, Attribute.AccessibilityRole, TAB_A11Y_ROLE),
    ).toBeTruthy();

    await expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate TabItem\'s "accessibilityRole" defaults to "ControlType.TabItem".', async () => {
    await expect(
      await TabsLegacyPageObject.compareAttribute(
        TabsLegacyPageObject.getTabItem(TabItem.First),
        Attribute.AccessibilityRole,
        TABITEM_A11Y_ROLE,
      ),
    ).toBeTruthy();

    await expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Tabs Legacy Functional Tests', () => {
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(async () => {
    await TabsLegacyPageObject.scrollToTestElement();

    // Reset the TabGroup by putting focus on First tab item
    await TabsLegacyPageObject.click(TabsLegacyPageObject.getTabItem(TabItem.First));
  });

  it('Click on the second tab header. Validate the second TabItem content is shown.', async () => {
    await TabsLegacyPageObject.click(TabsLegacyPageObject.getTabItem(TabItem.Second));

    await expect(
      await TabsLegacyPageObject.waitForTabItemContentToLoad(
        TabItem.Second,
        "Expected the second tab item's content to show by clicking the second tab item.",
      ),
    ).toBeTruthy();
    await expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  // Keyboarding is currently not integrated for UWP tabs - Task #5758598
  // it('Keyboarding: Arrow Navigation: Right -> Down -> Left -> Up -> Validate the correct TabItem content is shown', () => {
  //   /* At First tab element, press Right Arrow to navigate to the Second tab element */
  //   TabsPageObject.sendKey(Keys.Right_Arrow, TabItemSelector.First);
  //   TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.Second, PAGE_TIMEOUT);

  //   expect(TabsPageObject.didTabItemContentLoad(TabItemSelector.Second)).toBeTruthy();

  //   /* At Second tab element, press Down Arrow to navigate to the Third tab element */
  //   TabsPageObject.sendKey(Keys.Down_Arrow, TabItemSelector.Second);
  //   TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.Third, PAGE_TIMEOUT);

  //   expect(TabsPageObject.didTabItemContentLoad(TabItemSelector.Third)).toBeTruthy();

  //   /* At Third tab element, press Left Arrow to navigate to the Second tab element */
  //   TabsPageObject.sendKey(Keys.Left_Arrow, TabItemSelector.Third);
  //   TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.Second, PAGE_TIMEOUT);

  //   expect(TabsPageObject.didTabItemContentLoad(TabItemSelector.Second)).toBeTruthy();

  //   /* At Second tab element, press Up Arrow to navigate to the First tab element */
  //   TabsPageObject.sendKey(Keys.Up_Arrow, TabItemSelector.Second);
  //   TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.First, PAGE_TIMEOUT);

  //   expect(TabsPageObject.didTabItemContentLoad(TabItemSelector.First)).toBeTruthy();
  // });
});
