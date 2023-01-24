import NavigateAppPage from '../../common/NavigateAppPage';
import TabsLegacyPageObject, { TabItemSelector } from '../pages/TabsLegacyPageObject';
import { TAB_A11Y_ROLE, BOOT_APP_TIMEOUT, PAGE_TIMEOUT, TABITEM_A11Y_ROLE, Keys } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Tabs Legacy test page', async () => {
    await TabsLegacyPageObject.navigateToPageAndLoadTests(true);

    await expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Tabs Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(async () => {
    await TabsLegacyPageObject.scrollToTestElement();
  });

  it("Validate Tab's accessibilityRole is correct", async () => {
    await expect(await TabsLegacyPageObject.getAccessibilityRole()).toEqual(TAB_A11Y_ROLE);
    await expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Validate TabItem's accessibilityRole is correct", async () => {
    await expect(await TabsLegacyPageObject.getTabItemAccesibilityRole(TabItemSelector.First)).toEqual(TABITEM_A11Y_ROLE);
    await expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Tabs Legacy Functional Tests', () => {
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(async () => {
    await TabsLegacyPageObject.scrollToTestElement();

    // Reset the TabGroup by putting focus on First tab item
    await TabsLegacyPageObject.clickOnTabItem(TabItemSelector.First);
  });

  it('Click on the second tab header and validate the correct TabItem content is shown', async () => {
    await TabsLegacyPageObject.clickOnTabItem(TabItemSelector.Second);
    await TabsLegacyPageObject.waitForTabsItemsToOpen(TabItemSelector.Second, PAGE_TIMEOUT);

    await expect(await TabsLegacyPageObject.didTabItemContentLoad(TabItemSelector.Second)).toBeTruthy();
    await expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Keyboarding: Arrow Navigation: Right -> Down -> Left -> Up -> Validate the correct TabItem content is shown', async () => {
    /* At First tab element, press Right Arrow to navigate to the Second tab element */
    await TabsLegacyPageObject.sendKey(Keys.ARROW_RIGHT, TabItemSelector.First);
    await TabsLegacyPageObject.waitForTabsItemsToOpen(TabItemSelector.Second, PAGE_TIMEOUT);

    await expect(await TabsLegacyPageObject.didTabItemContentLoad(TabItemSelector.Second)).toBeTruthy();

    /* At Second tab element, press Down Arrow to navigate to the Third tab element */
    await TabsLegacyPageObject.sendKey(Keys.ARROW_DOWN, TabItemSelector.Second);
    await TabsLegacyPageObject.waitForTabsItemsToOpen(TabItemSelector.Third, PAGE_TIMEOUT);

    await expect(await TabsLegacyPageObject.didTabItemContentLoad(TabItemSelector.Third)).toBeTruthy();

    /* At Third tab element, press Left Arrow to navigate to the Second tab element */
    await TabsLegacyPageObject.sendKey(Keys.ARROW_LEFT, TabItemSelector.Third);
    await TabsLegacyPageObject.waitForTabsItemsToOpen(TabItemSelector.Second, PAGE_TIMEOUT);

    await expect(await TabsLegacyPageObject.didTabItemContentLoad(TabItemSelector.Second)).toBeTruthy();

    /* At Second tab element, press Up Arrow to navigate to the First tab element */
    await TabsLegacyPageObject.sendKey(Keys.ARROW_UP, TabItemSelector.Second);
    await TabsLegacyPageObject.waitForTabsItemsToOpen(TabItemSelector.First, PAGE_TIMEOUT);

    await expect(await TabsLegacyPageObject.didTabItemContentLoad(TabItemSelector.First)).toBeTruthy();
    await expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});
