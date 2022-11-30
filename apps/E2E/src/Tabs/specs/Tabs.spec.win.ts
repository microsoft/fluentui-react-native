import NavigateAppPage from '../../common/NavigateAppPage';
import TabsPageObject, { TabItemSelector } from '../pages/TabsPageObject';
import { TAB_A11Y_ROLE, BOOT_APP_TIMEOUT, PAGE_TIMEOUT, TABITEM_A11Y_ROLE, Keys } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Tabs test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTabsPage();
    await TabsPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TabsPageObject.isPageLoaded()).toBeTruthy(TabsPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await TabsPageObject.didAssertPopup()).toBeFalsy(TabsPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Tabs Accessibility Testing', () => {
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(async () => {
    await TabsPageObject.scrollToTestElement();
    await TabsPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it("Validate Tab's accessibilityRole is correct", async () => {
    await expect(await TabsPageObject.getAccessibilityRole()).toEqual(TAB_A11Y_ROLE);
    await expect(await TabsPageObject.didAssertPopup()).toBeFalsy(TabsPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Validate TabItem's accessibilityRole is correct", async () => {
    await expect(await TabsPageObject.getTabItemAccesibilityRole(TabItemSelector.First)).toEqual(TABITEM_A11Y_ROLE);
    await expect(await TabsPageObject.didAssertPopup()).toBeFalsy(TabsPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Tabs Functional Tests', () => {
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(async () => {
    await TabsPageObject.scrollToTestElement();
    await TabsPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    // Reset the TabGroup by putting focus on First tab item
    await TabsPageObject.clickOnTabItem(TabItemSelector.First);
  });

  it('Click on the second tab header and validate the correct TabItem content is shown', async () => {
    await TabsPageObject.clickOnTabItem(TabItemSelector.Second);
    await TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.Second, PAGE_TIMEOUT);

    await expect(await TabsPageObject.didTabItemContentLoad(TabItemSelector.Second)).toBeTruthy();
    await expect(await TabsPageObject.didAssertPopup()).toBeFalsy(TabsPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Keyboarding: Arrow Navigation: Right -> Down -> Left -> Up -> Validate the correct TabItem content is shown', async () => {
    /* At First tab element, press Right Arrow to navigate to the Second tab element */
    await TabsPageObject.sendKey(Keys.ARROW_RIGHT, TabItemSelector.First);
    await TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.Second, PAGE_TIMEOUT);

    await expect(await TabsPageObject.didTabItemContentLoad(TabItemSelector.Second)).toBeTruthy();

    /* At Second tab element, press Down Arrow to navigate to the Third tab element */
    await TabsPageObject.sendKey(Keys.ARROW_DOWN, TabItemSelector.Second);
    await TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.Third, PAGE_TIMEOUT);

    await expect(await TabsPageObject.didTabItemContentLoad(TabItemSelector.Third)).toBeTruthy();

    /* At Third tab element, press Left Arrow to navigate to the Second tab element */
    await TabsPageObject.sendKey(Keys.ARROW_LEFT, TabItemSelector.Third);
    await TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.Second, PAGE_TIMEOUT);

    await expect(await TabsPageObject.didTabItemContentLoad(TabItemSelector.Second)).toBeTruthy();

    /* At Second tab element, press Up Arrow to navigate to the First tab element */
    await TabsPageObject.sendKey(Keys.ARROW_UP, TabItemSelector.Second);
    await TabsPageObject.waitForTabsItemsToOpen(TabItemSelector.First, PAGE_TIMEOUT);

    await expect(await TabsPageObject.didTabItemContentLoad(TabItemSelector.First)).toBeTruthy();
    await expect(await TabsPageObject.didAssertPopup()).toBeFalsy(TabsPageObject.ERRORMESSAGE_ASSERT);
  });
});
