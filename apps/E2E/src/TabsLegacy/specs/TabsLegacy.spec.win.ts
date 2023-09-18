import { TAB_A11Y_ROLE, TABITEM_A11Y_ROLE, Keys, Attribute } from '../../common/consts';
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

  it('Input the following arrow keys on the tabs: Right -> Down -> Left -> Up. Validate the correct TabItem content gets shown.', async () => {
    /* At First tab element, press Right Arrow to navigate to the Second tab element */
    await TabsLegacyPageObject.sendKeys(TabsLegacyPageObject.getTabItem('First'), [Keys.ARROW_RIGHT]);

    expect(
      await TabsLegacyPageObject.waitForTabItemContentToLoad(
        'Second',
        'Expected the second tab item\'s content to show by pressing "Right Arrow" on the first tab item.',
      ),
    ).toBeTruthy();

    /* At Second tab element, press Down Arrow to navigate to the Third tab element */
    await TabsLegacyPageObject.sendKeys(TabsLegacyPageObject.getTabItem('Second'), [Keys.ARROW_DOWN]);

    expect(
      await TabsLegacyPageObject.waitForTabItemContentToLoad(
        'Third',
        'Expected the third tab item\'s content to show by pressing "Down Arrow" on the second tab item.',
      ),
    ).toBeTruthy();

    /* At Third tab element, press Left Arrow to navigate to the Second tab element */
    await TabsLegacyPageObject.sendKeys(TabsLegacyPageObject.getTabItem('Third'), [Keys.ARROW_LEFT]);

    expect(
      await TabsLegacyPageObject.waitForTabItemContentToLoad(
        'Second',
        'Expected the second tab item\'s content to show by pressing "Left Arrow" on the third tab item.',
      ),
    ).toBeTruthy();

    /* At Second tab element, press Up Arrow to navigate to the First tab element */
    await TabsLegacyPageObject.sendKeys(TabsLegacyPageObject.getTabItem('Second'), [Keys.ARROW_UP]);

    expect(
      await TabsLegacyPageObject.waitForTabItemContentToLoad(
        'First',
        'Expected the first tab item\'s content to show by pressing "Up Arrow" on the first tab item.',
      ),
    ).toBeTruthy();
    expect(await TabsLegacyPageObject.didAssertPopup()).toBeFalsy(TabsLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});
