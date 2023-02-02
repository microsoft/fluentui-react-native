import { Keys, PAGE_TIMEOUT, TABITEM_A11Y_ROLE, TAB_A11Y_ROLE } from '../../common/consts';
import TabsLegacyPageObject from '../pages/TabsLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await TabsLegacyPageObject.waitForInitialPageToDisplay();
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
    await expect(await TabsLegacyPageObject.getTabItemAccesibilityRole('First')).toEqual(TABITEM_A11Y_ROLE);
    await expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Tabs Legacy Functional Tests', () => {
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(async () => {
    await TabsLegacyPageObject.scrollToTestElement();

    // Reset the TabGroup by putting focus on First tab item
    await TabsLegacyPageObject.clickOnTabItem('First');
  });

  it('Click on the second tab header and validate the correct TabItem content is shown', async () => {
    await TabsLegacyPageObject.clickOnTabItem('Second');
    await TabsLegacyPageObject.waitForTabsItemsToOpen('Second', PAGE_TIMEOUT);

    await expect(await TabsLegacyPageObject.didTabItemContentLoad('Second')).toBeTruthy();
    await expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Keyboarding: Arrow Navigation: Right -> Down -> Left -> Up -> Validate the correct TabItem content is shown', async () => {
    /* At First tab element, press Right Arrow to navigate to the Second tab element */
    await TabsLegacyPageObject.sendKey(Keys.ARROW_RIGHT, 'First');
    await TabsLegacyPageObject.waitForTabsItemsToOpen('Second', PAGE_TIMEOUT);

    await expect(await TabsLegacyPageObject.didTabItemContentLoad('Second')).toBeTruthy();

    /* At Second tab element, press Down Arrow to navigate to the Third tab element */
    await TabsLegacyPageObject.sendKey(Keys.ARROW_DOWN, 'Second');
    await TabsLegacyPageObject.waitForTabsItemsToOpen('Third', PAGE_TIMEOUT);

    await expect(await TabsLegacyPageObject.didTabItemContentLoad('Third')).toBeTruthy();

    /* At Third tab element, press Left Arrow to navigate to the Second tab element */
    await TabsLegacyPageObject.sendKey(Keys.ARROW_LEFT, 'Third');
    await TabsLegacyPageObject.waitForTabsItemsToOpen('Second', PAGE_TIMEOUT);

    await expect(await TabsLegacyPageObject.didTabItemContentLoad('Second')).toBeTruthy();

    /* At Second tab element, press Up Arrow to navigate to the First tab element */
    await TabsLegacyPageObject.sendKey(Keys.ARROW_UP, 'Second');
    await TabsLegacyPageObject.waitForTabsItemsToOpen('First', PAGE_TIMEOUT);

    await expect(await TabsLegacyPageObject.didTabItemContentLoad('First')).toBeTruthy();
    await expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});
