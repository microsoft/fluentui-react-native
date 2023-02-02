import { PAGE_TIMEOUT, TABITEM_A11Y_ROLE, TAB_A11Y_ROLE } from '../../common/consts';
import TabsLegacyPageObject from '../pages/TabsLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await TabsLegacyPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Tabs Legacy test page', async () => {
    await TabsLegacyPageObject.navigateToPageAndLoadTests(true);

    expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Tabs Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(async () => {
    await TabsLegacyPageObject.scrollToTestElement();
  });

  it("Validate Tab's accessibilityRole is correct", async () => {
    expect(await TabsLegacyPageObject.getAccessibilityRole()).toEqual(TAB_A11Y_ROLE);
  });

  it("Validate TabItem's accessibilityRole is correct", async () => {
    expect(await TabsLegacyPageObject.getTabItemAccesibilityRole('First')).toEqual(TABITEM_A11Y_ROLE);
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

    expect(await TabsLegacyPageObject.didTabItemContentLoad('Second')).toBeTruthy();
  });

  // Keyboarding is currently not integrated for UWP tabs - Task #5758598
  // it('Keyboarding: Arrow Navigation: Right -> Down -> Left -> Up -> Validate the correct TabItem content is shown', () => {
  //   /* At First tab element, press Right Arrow to navigate to the Second tab element */
  //   TabsPageObject.sendKey(Keys.Right_Arrow, 'First');
  //   TabsPageObject.waitForTabsItemsToOpen('Second', PAGE_TIMEOUT);

  //   expect(TabsPageObject.didTabItemContentLoad('Second')).toBeTruthy();

  //   /* At Second tab element, press Down Arrow to navigate to the Third tab element */
  //   TabsPageObject.sendKey(Keys.Down_Arrow, 'Second');
  //   TabsPageObject.waitForTabsItemsToOpen('Third', PAGE_TIMEOUT);

  //   expect(TabsPageObject.didTabItemContentLoad('Third')).toBeTruthy();

  //   /* At Third tab element, press Left Arrow to navigate to the Second tab element */
  //   TabsPageObject.sendKey(Keys.Left_Arrow, 'Third');
  //   TabsPageObject.waitForTabsItemsToOpen('Second', PAGE_TIMEOUT);

  //   expect(TabsPageObject.didTabItemContentLoad('Second')).toBeTruthy();

  //   /* At Second tab element, press Up Arrow to navigate to the First tab element */
  //   TabsPageObject.sendKey(Keys.Up_Arrow, 'Second');
  //   TabsPageObject.waitForTabsItemsToOpen('First', PAGE_TIMEOUT);

  //   expect(TabsPageObject.didTabItemContentLoad('First')).toBeTruthy();
  // });
});
