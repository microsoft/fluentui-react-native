import { TABITEM_A11Y_ROLE, TAB_A11Y_ROLE, Attribute } from '../../common/consts';
import TabsLegacyPageObject from '../pages/TabsLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Tabs Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await TabsLegacyPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Tabs Legacy test page', async () => {
    expect(await TabsLegacyPageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await TabsLegacyPageObject.enableE2ETesterMode()).toBeTrue();

    expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Tabs Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(async () => {
    await TabsLegacyPageObject.scrollToTestElement();
  });

  it('Validate Tab\'s "accessibilityRole" defaults to "ControlType.Tab".', async () => {
    expect(
      await TabsLegacyPageObject.compareAttribute(TabsLegacyPageObject._primaryComponent, Attribute.AccessibilityRole, TAB_A11Y_ROLE),
    ).toBeTruthy();
  });

  it('Validate TabItem\'s "accessibilityRole" defaults to "ControlType.TabItem".', async () => {
    expect(
      await TabsLegacyPageObject.compareAttribute(TabsLegacyPageObject.getTabItem('First'), Attribute.AccessibilityRole, TABITEM_A11Y_ROLE),
    ).toBeTruthy();
  });
});

describe('Tabs Legacy Functional Tests', () => {
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(async () => {
    await TabsLegacyPageObject.scrollToTestElement();

    // Reset the TabGroup by putting focus on First tab item
    await TabsLegacyPageObject.click(TabsLegacyPageObject.getTabItem('First'));
  });

  it('Click on the second tab header. Validate the second TabItem content is shown.', async () => {
    await TabsLegacyPageObject.click(TabsLegacyPageObject.getTabItem('Second'));

    expect(
      await TabsLegacyPageObject.waitForTabItemContentToLoad(
        'Second',
        "Expected the second tab item's content to show by clicking the second tab item.",
      ),
    ).toBeTruthy();
    expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT);
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
