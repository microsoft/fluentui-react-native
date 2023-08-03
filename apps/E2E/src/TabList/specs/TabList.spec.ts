import { Attribute, TAB_A11Y_ROLE, TABITEM_A11Y_ROLE } from '../../index.consts';
import { FIRST_TAB_ACCESSIBILITY_LABEL, SECOND_TAB_LABEL, TABLIST_ACCESSIBILITY_LABEL } from '../consts';
import TabListPageObject from '../pages/TabListPageObject';

describe('TabList Testing Initialization', () => {
  it('Wait for app load', async () => {
    await TabListPageObject.waitForInitialPageToDisplay();
    expect(await TabListPageObject.isInitialPageDisplayed())
      .withContext(TabListPageObject.ERRORMESSAGE_APPLOAD)
      .toBeTruthy();
  });

  it('Click and navigate to TabList test page', async () => {
    await TabListPageObject.navigateToPageAndLoadTests(true);
    expect(await TabListPageObject.isPageLoaded())
      .withContext(TabListPageObject.ERRORMESSAGE_PAGELOAD)
      .toBeTruthy();

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

    expect(await TabListPageObject.didAssertPopup())
      .withContext(TabListPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Validate Tab\'s "accessibilityRole" defaults to "ControlType.TabItem"', async () => {
    expect(
      await TabListPageObject.compareAttribute(TabListPageObject.getTab('First'), Attribute.AccessibilityRole, TABITEM_A11Y_ROLE),
    ).toBeTruthy();

    expect(await TabListPageObject.didAssertPopup())
      .withContext(TabListPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Set TabList "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await TabListPageObject.compareAttribute(
        TabListPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        TABLIST_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    expect(await TabListPageObject.didAssertPopup())
      .withContext(TabListPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Set Tab "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await TabListPageObject.compareAttribute(
        TabListPageObject.getTab('First'),
        Attribute.AccessibilityLabel,
        FIRST_TAB_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    expect(await TabListPageObject.didAssertPopup())
      .withContext(TabListPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Do not set "accessibilityLabel" prop. Validate "Name" element attribute defaults to current Tab label.', async () => {
    expect(
      await TabListPageObject.compareAttribute(TabListPageObject.getTab('Second'), Attribute.AccessibilityLabel, SECOND_TAB_LABEL),
    ).toBeTruthy();

    expect(await TabListPageObject.didAssertPopup())
      .withContext(TabListPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});
