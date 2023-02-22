import { Attribute, AttributeValue, Keys, MENUITEM_A11Y_ROLE } from '../../common/consts';
import { MENUITEM_ACCESSIBILITY_LABEL, MENUITEM_TEST_LABEL } from '../consts';
import MenuPageObject from '../pages/MenuPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Menu Testing Initialization', () => {
  it('Wait for app load', async () => {
    await MenuPageObject.waitForInitialPageToDisplay();
    expect(await MenuPageObject.isInitialPageDisplayed()).toBeTruthy(MenuPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Menu test page', async () => {
    /* Click on component button to navigate to test page */
    await MenuPageObject.navigateToPageAndLoadTests(true);
    expect(await MenuPageObject.isPageLoaded()).toBeTruthy(MenuPageObject.ERRORMESSAGE_PAGELOAD);

    expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Menu Accessibility Testing', () => {
  beforeAll(async () => {
    await MenuPageObject.scrollToTestElement(await MenuPageObject._menuTrigger);
    await MenuPageObject.openMenu();
  });

  it('Validate MenuItem "accessibilityRole" defaults to "ControlType.MenuItem".', async () => {
    // The popover is where we can find the a11y role of menu
    expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem('First'), Attribute.AccessibilityRole, MENUITEM_A11Y_ROLE),
    ).toBeTruthy();

    expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set MenuItem "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await MenuPageObject.compareAttribute(
        MenuPageObject.getMenuItem('First'),
        Attribute.AccessibilityLabel,
        MENUITEM_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set MenuItem "accessibilityLabel". Validate MenuItem "Name" element attribute defaults to current MenuItem label.', async () => {
    expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem('Third'), Attribute.AccessibilityLabel, MENUITEM_TEST_LABEL),
    ).toBeTruthy();

    expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Toggle Menu by click. Validate "ExpandCollapseState" element attribute correctly changes.', async () => {
    expect(
      await MenuPageObject.compareAttribute(MenuPageObject._menuTrigger, Attribute.ExpandCollapseState, AttributeValue.expanded),
    ).toBeTruthy();

    await MenuPageObject.closeMenu();

    expect(
      await MenuPageObject.compareAttribute(MenuPageObject._menuTrigger, Attribute.ExpandCollapseState, AttributeValue.collapsed),
    ).toBeTruthy();

    expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Menu Functional Testing', () => {
  /* Scrolls and waits for the Menu to be visible on the Test Page */
  beforeEach(async () => {
    await MenuPageObject.scrollToTestElement(await MenuPageObject._menuTrigger);

    await MenuPageObject.resetTest();
  });

  it('Click MenuTrigger. Validate Menu is opened by checking if MenuItems are visible.', async () => {
    await MenuPageObject.click(MenuPageObject._menuTrigger);
    expect(await MenuPageObject.waitForMenuToOpen()).toBeTruthy();

    expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Enter" on MenuTrigger. Validate Menu is opened by checking if MenuItems are visible.', async () => {
    await MenuPageObject.sendKeys(MenuPageObject._menuTrigger, [Keys.ENTER]);
    expect(await MenuPageObject.waitForMenuToOpen()).toBeTruthy();

    expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Space" on MenuTrigger. Validate Menu is opened by checking if MenuItems are visible.', async () => {
    await MenuPageObject.sendKeys(MenuPageObject._menuTrigger, [Keys.SPACE]);
    expect(await MenuPageObject.waitForMenuToOpen()).toBeTruthy();

    expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Space", Press "Enter", and "Click" on MenuItem. Validate that onClick() callback fires correctly.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('First'), [Keys.SPACE]);
    await MenuPageObject.waitForItemCallbackToFire(1);
    expect(await MenuPageObject.itemOnClickHasFired(1)).toBeTruthy('Space input failed to fire MenuItem onClick callback');

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('First'), [Keys.ENTER]);
    await MenuPageObject.waitForItemCallbackToFire(2);
    expect(await MenuPageObject.itemOnClickHasFired(2)).toBeTruthy('Enter input failed to fire MenuItem onClick callback');

    await MenuPageObject.click(MenuPageObject.getMenuItem('First'));
    await MenuPageObject.waitForItemCallbackToFire(3);
    expect(await MenuPageObject.itemOnClickHasFired(3)).toBeTruthy('Click input failed to fire MenuItem onClick callback');

    expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Space", Press "Enter", and "Click" on disabled MenuItem. Validate that onClick() callback does not fire.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('Second'), [Keys.SPACE]);
    await MenuPageObject.waitForItemCallbackToFire(0);
    expect(await MenuPageObject.itemOnClickHasFired(0)).toBeTruthy('Space input fired disabled MenuItem onClick callback');

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('Second'), [Keys.ENTER]);
    await MenuPageObject.waitForItemCallbackToFire(0);
    expect(await MenuPageObject.itemOnClickHasFired(0)).toBeTruthy('Enter input fired disabled MenuItem onClick callback');

    await MenuPageObject.click(MenuPageObject.getMenuItem('Second'));
    await MenuPageObject.waitForItemCallbackToFire(0);
    expect(await MenuPageObject.itemOnClickHasFired(0)).toBeTruthy('Click input fired disabled MenuItem onClick callback');

    expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Up" + "Down" to navigate between MenuItems. Validate that focus switches correctly between MenuItems.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('First'), [Keys.DOWN]);
    expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem('Second'), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('Second'), [Keys.UP]);
    expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem('First'), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('First'), [Keys.UP]);
    expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem('Fourth'), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Tab" to navigate between MenuItems. Validate that focus switches correctly between MenuItems.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('Third'), [Keys.TAB]);
    expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem('Fourth'), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('Fourth'), [Keys.TAB]);
    expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem('First'), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Escape" on MenuItem. Validate that Menu closes by checking if MenuItems are not visible.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('First'), [Keys.ESCAPE]);
    expect(await MenuPageObject.menuIsExpanded()).toBeFalsy(
      'Expected the Menu to close, but its MenuItems are still displayed - the menu appears to still be open.',
    );

    expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });
});
