import { Attribute, AttributeValue, Keys, MENUITEM_A11Y_ROLE } from '../../common/consts';
import { MENUITEM_ACCESSIBILITY_LABEL, MENUITEM_TEST_LABEL } from '../consts';
import MenuPageObject from '../pages/MenuPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Menu Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await MenuPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Menu test page', async () => {
    /* Click on component button to navigate to test page */
    expect(await MenuPageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await MenuPageObject.enableE2ETesterMode()).toBeTrue();

    expect(await MenuPageObject.didAssertPopup())
      .withContext(MenuPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy(); // Ensure no asserts popped up
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
  });

  it('Set MenuItem "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    expect(
      await MenuPageObject.compareAttribute(
        MenuPageObject.getMenuItem('First'),
        Attribute.AccessibilityLabel,
        MENUITEM_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Do not set MenuItem "accessibilityLabel". Validate MenuItem "Name" element attribute defaults to current MenuItem label.', async () => {
    expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem('Third'), Attribute.AccessibilityLabel, MENUITEM_TEST_LABEL),
    ).toBeTruthy();
  });

  it('Toggle Menu by click. Validate "ExpandCollapseState" element attribute correctly changes.', async () => {
    expect(
      await MenuPageObject.compareAttribute(MenuPageObject._menuTrigger, Attribute.ExpandCollapseState, AttributeValue.expanded),
    ).toBeTruthy();

    await MenuPageObject.closeMenu();

    expect(
      await MenuPageObject.compareAttribute(MenuPageObject._menuTrigger, Attribute.ExpandCollapseState, AttributeValue.collapsed),
    ).toBeTruthy();

    expect(await MenuPageObject.didAssertPopup())
      .withContext(MenuPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
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

    expect(await MenuPageObject.didAssertPopup())
      .withContext(MenuPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Press "Enter" on MenuTrigger. Validate Menu is opened by checking if MenuItems are visible.', async () => {
    await MenuPageObject.sendKeys(MenuPageObject._menuTrigger, [Keys.ENTER]);
    expect(await MenuPageObject.waitForMenuToOpen()).toBeTruthy();

    expect(await MenuPageObject.didAssertPopup())
      .withContext(MenuPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Press "Space" on MenuTrigger. Validate Menu is opened by checking if MenuItems are visible.', async () => {
    await MenuPageObject.sendKeys(MenuPageObject._menuTrigger, [Keys.SPACE]);
    expect(await MenuPageObject.waitForMenuToOpen()).toBeTruthy();

    expect(await MenuPageObject.didAssertPopup())
      .withContext(MenuPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Press "Space", Press "Enter", and "Click" on MenuItem. Validate that onClick() callback fires correctly.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('First'), [Keys.SPACE]);
    expect(await MenuPageObject.waitForItemCallbackToFire(1, 'Space input failed to fire MenuItem onClick callback')).toBeTrue();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('First'), [Keys.ENTER]);
    expect(await MenuPageObject.waitForItemCallbackToFire(2, 'Enter input failed to fire MenuItem onClick callback')).toBeTrue();

    await MenuPageObject.click(MenuPageObject.getMenuItem('First'));
    expect(await MenuPageObject.waitForItemCallbackToFire(3, 'Click input failed to fire MenuItem onClick callback')).toBeTrue();

    expect(await MenuPageObject.didAssertPopup())
      .withContext(MenuPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Press "Space", Press "Enter", and "Click" on disabled MenuItem. Validate that onClick() callback does not fire.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('Second'), [Keys.SPACE]);
    await MenuPageObject.waitForItemCallbackToFire(0);
    expect(await MenuPageObject.waitForItemCallbackToFire(0, 'Space input fired disabled MenuItem onClick callback')).toBeTrue();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('Second'), [Keys.ENTER]);
    expect(await MenuPageObject.waitForItemCallbackToFire(0, 'Enter input fired disabled MenuItem onClick callback')).toBeTrue();

    await MenuPageObject.click(MenuPageObject.getMenuItem('Second'));
    expect(await MenuPageObject.waitForItemCallbackToFire(0, 'Click input fired disabled MenuItem onClick callback')).toBeTrue();

    expect(await MenuPageObject.didAssertPopup())
      .withContext(MenuPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
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

    expect(await MenuPageObject.didAssertPopup())
      .withContext(MenuPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Press "Tab" to navigate between MenuGroups. Validate that focus switches correctly between MenuGroups.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('First'), [Keys.TAB]);
    expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem('Third'), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('Third'), [Keys.TAB]);
    expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem('First'), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    expect(await MenuPageObject.didAssertPopup())
      .withContext(MenuPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Press "Escape" on MenuItem. Validate that Menu closes by checking if MenuItems are not visible.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem('First'), [Keys.ESCAPE]);
    expect(await MenuPageObject.menuIsExpanded()).toBeFalsy(
      'Expected the Menu to close, but its MenuItems are still displayed - the menu appears to still be open.',
    );

    expect(await MenuPageObject.didAssertPopup())
      .withContext(MenuPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});
