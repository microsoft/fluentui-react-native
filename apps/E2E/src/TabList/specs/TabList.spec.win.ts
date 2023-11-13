import { Attribute, AttributeValue, Keys, TAB_A11Y_ROLE, TABITEM_A11Y_ROLE } from '../../index.consts';
import {
  FIRST_TAB_ACCESSIBILITY_LABEL,
  FIRST_TAB_KEY,
  FOURTH_TAB_KEY,
  SECOND_TAB_KEY,
  SECOND_TAB_LABEL,
  TABLIST_ACCESSIBILITY_LABEL,
} from '../consts';
import TabListPageObject from '../pages/TabListPageObject';

describe('TabList Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await TabListPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to TabList test page', async () => {
    expect(await TabListPageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await TabListPageObject.enableE2ETesterMode()).toBeTrue();

    expect(await TabListPageObject.didAssertPopup())
      .withContext(TabListPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});

describe('TabList Accessibility Testing', () => {
  beforeEach(async () => {
    await TabListPageObject.scrollToTestElement();
  });

  it('Validate TabList\'s "accessibilityRole" defaults to "ControlType.Tab"', async () => {
    expect(
      await TabListPageObject.compareAttribute(TabListPageObject._primaryComponent, Attribute.AccessibilityRole, TAB_A11Y_ROLE),
    ).toBeTruthy();
  });

  it('Validate Tab\'s "accessibilityRole" defaults to "ControlType.TabItem"', async () => {
    expect(
      await TabListPageObject.compareAttribute(TabListPageObject.getTab('First'), Attribute.AccessibilityRole, TABITEM_A11Y_ROLE),
    ).toBeTruthy();
  });

  it('Set TabList "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await TabListPageObject.compareAttribute(
        TabListPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        TABLIST_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Set Tab "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await TabListPageObject.compareAttribute(
        TabListPageObject.getTab('First'),
        Attribute.AccessibilityLabel,
        FIRST_TAB_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Do not set "accessibilityLabel" prop. Validate "Name" element attribute defaults to current Tab label.', async () => {
    expect(
      await TabListPageObject.compareAttribute(TabListPageObject.getTab('Second'), Attribute.AccessibilityLabel, SECOND_TAB_LABEL),
    ).toBeTruthy();
  });
});

describe('TabList Functional Testing', () => {
  beforeEach(async () => {
    // Section is run before each case to reset focus / selection to the first tab of the first list
    await TabListPageObject.scrollToTestElement();
    await TabListPageObject.resetListSelection();
  });

  it('Click on Tab. Validate that it changes state from unselected to selected.', async () => {
    // Validate Tab is not initially selected
    expect(await (await TabListPageObject.getTab('Second')).isSelected())
      .withContext('Expected tab #2 to be unselected at test start, but #2 was initially selected.')
      .toBeFalsy();

    // Click on Tab to select it
    await TabListPageObject.click(TabListPageObject.getTab('Second'));

    // Validate Tab is selected
    await TabListPageObject.waitForTabSelected('Second', 'Expected tab #2 to be selected by click, but #2 remained unselected.');

    expect(await TabListPageObject.didAssertPopup())
      .withContext(TabListPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Navigate to unselected tab using "RIGHT ARROW" key and press "ENTER". Validate tab is first focused then selected.', async () => {
    // Validate Tab is not initially selected
    expect(await (await TabListPageObject.getTab('Second')).isSelected())
      .withContext('Expected tab #2 to be unselected at test start, but #2 was initially selected.')
      .toBeFalsy();

    // Press RIGHT ARROW on TabList to focus on next
    await TabListPageObject.sendKeys(TabListPageObject.getTab('First'), [Keys.ARROW_RIGHT]);
    await TabListPageObject.waitForTabFocused('Second', 'Expected tab #2 to be focused after RIGHT ARROW, but #2 remained focused.');

    // Press ENTER to select
    await TabListPageObject.sendKeys(TabListPageObject.getTab('Second'), [Keys.ENTER]);

    // Validate Tab is selected
    await TabListPageObject.waitForTabSelected('Second', 'Expected tab #2 to be selected by ENTER, but #2 remained unselected.');

    expect(await TabListPageObject.didAssertPopup())
      .withContext(TabListPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Navigate to tab next to disabled and press "RIGHT ARROW". Validate disabled tab skips focus.', async () => {
    // Press RIGHT ARROW on TabList to focus on next enabled tab
    await TabListPageObject.sendKeys(TabListPageObject.getTab('Second'), [Keys.ARROW_RIGHT]);
    await TabListPageObject.waitForTabFocused('Fourth', 'Expected tab #4 to be focused after RIGHT ARROW, but #4 was not focused.');

    expect(await TabListPageObject.didAssertPopup())
      .withContext(TabListPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Press TAB on TabList. Expect selected button of next list to be selected.', async () => {
    // Validate Tab is not initially selected
    expect(await TabListPageObject.compareAttribute(TabListPageObject.getTab('First'), Attribute.IsFocused, AttributeValue.true))
      .withContext('Expected tab #3 to be unfocused at test start, but #3 was initially selected.')
      .toBeTrue();

    // Press RIGHT ARROW on TabList to focus on next enabled tab
    await TabListPageObject.sendKeys(TabListPageObject.getTab('First'), [Keys.TAB]);
    await TabListPageObject.waitForTabFocused('Fifth', 'Expected tab #5 to be focused after TAB, but #5 was not focused.');

    expect(await TabListPageObject.didAssertPopup())
      .withContext(TabListPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Ensure "onTabSelect" callback fires when selecting tabs.', async () => {
    const selectorToKeys = [
      ['First', FIRST_TAB_KEY],
      ['Second', SECOND_TAB_KEY],
      ['Fourth', FOURTH_TAB_KEY],
    ];

    for (const [selector, key] of selectorToKeys) {
      await TabListPageObject.click(TabListPageObject.getTab(selector as any));
      await TabListPageObject.waitForTabSelected(
        selector as any,
        `Expected ${selector} tab to be selected when clicked, but tab wasn't selected.`,
      );

      await TabListPageObject.waitForCallbackToFire(
        key,
        `Expected TabList "onTabSelect" callback to fire when ${selector} was clicked, but callback didn't fire.`,
      );
    }

    expect(await TabListPageObject.didAssertPopup())
      .withContext(TabListPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});
