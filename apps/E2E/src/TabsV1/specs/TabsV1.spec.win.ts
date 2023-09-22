import { Attribute, Keys, TAB_A11Y_ROLE, TABITEM_A11Y_ROLE } from '../../common/consts';
import TabsV1PageObject from '../pages/TabsV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('TabsV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await TabsV1PageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to TabsV1 test page', async () => {
    expect(await TabsV1PageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await TabsV1PageObject.enableE2ETesterMode()).toBeTrue();

    expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('TabsV1 Accessibility Testing', () => {
  it('Validate Tab\'s "accessibilityRole" defaults to "ControlType.Tab".', async () => {
    expect(
      await TabsV1PageObject.compareAttribute(TabsV1PageObject._primaryComponent, Attribute.AccessibilityRole, TAB_A11Y_ROLE),
    ).toBeTruthy();
  });

  it('Validate TabItem\'s "accessibilityRole" defaults to "ControlType.TabItem".', async () => {
    expect(
      await TabsV1PageObject.compareAttribute(TabsV1PageObject.getTabItem('First'), Attribute.AccessibilityRole, TABITEM_A11Y_ROLE),
    ).toBeTruthy();
  });
});

describe('TabsV1 Functional Tests', () => {
  /* Scrolls and waits for the Tabs to be visible on the Test Page */
  beforeEach(async () => {
    await TabsV1PageObject.scrollToTestElement();

    // Reset the TabGroup by putting focus on First tab item
    await TabsV1PageObject.resetListSelection();
  });

  it('Click on the second tab header. Validate the second TabItem content is shown.', async () => {
    await TabsV1PageObject.click(TabsV1PageObject.getTabItem('Second'));

    expect(
      await TabsV1PageObject.waitForTabItemContentToLoad(
        'Second',
        "Expected the second tab item's content to show by clicking the second tab item.",
      ),
    ).toBeTruthy();
    expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Input the following arrow keys on the tabs: Right -> Down -> Left -> Up. Validate the correct TabItem content gets shown.', async () => {
    /* At First tab element, press Right Arrow to navigate to the Second tab element */
    await TabsV1PageObject.sendKeys(TabsV1PageObject.getTabItem('First'), [Keys.ARROW_RIGHT]);

    expect(
      await TabsV1PageObject.waitForTabItemContentToLoad(
        'Second',
        'Expected the second tab item\'s content to show by pressing "Right Arrow" on the first tab item.',
      ),
    ).toBeTruthy();

    /* At Second tab element, press Down Arrow to navigate to the Third tab element */
    await TabsV1PageObject.sendKeys(TabsV1PageObject.getTabItem('Second'), [Keys.ARROW_DOWN]);

    expect(
      await TabsV1PageObject.waitForTabItemContentToLoad(
        'Third',
        'Expected the third tab item\'s content to show by pressing "Down Arrow" on the second tab item.',
      ),
    ).toBeTruthy();

    /* At Third tab element, press Left Arrow to navigate to the Second tab element */
    await TabsV1PageObject.sendKeys(TabsV1PageObject.getTabItem('Third'), [Keys.ARROW_LEFT]);

    expect(
      await TabsV1PageObject.waitForTabItemContentToLoad(
        'Second',
        'Expected the second tab item\'s content to show by pressing "Left Arrow" on the third tab item.',
      ),
    ).toBeTruthy();

    /* At Second tab element, press Up Arrow to navigate to the First tab element */
    await TabsV1PageObject.sendKeys(TabsV1PageObject.getTabItem('Second'), [Keys.ARROW_UP]);

    expect(
      await TabsV1PageObject.waitForTabItemContentToLoad(
        'First',
        'Expected the first tab item\'s content to show by pressing "Up Arrow" on the first tab item.',
      ),
    ).toBeTruthy();

    expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
