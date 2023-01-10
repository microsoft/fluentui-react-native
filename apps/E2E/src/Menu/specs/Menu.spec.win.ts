import NavigateAppPage from '../../common/NavigateAppPage';
import MenuPageObject, { MenuItem } from '../pages/MenuPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys, MENUITEM_A11Y_ROLE, AttributeValue, Attribute } from '../../common/consts';
import { MENUITEM_ACCESSIBILITY_LABEL, MENUITEM_TEST_LABEL } from '../consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Menu Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);

    await NavigateAppPage.expandE2ESections();
  });

  it('Click and navigate to Menu test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToMenuPage();
    await MenuPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await MenuPageObject.isPageLoaded()).toBeTruthy(MenuPageObject.ERRORMESSAGE_PAGELOAD);

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Menu Accessibility Testing', () => {
  beforeAll(async () => {
    await MenuPageObject.scrollToTestElement(await MenuPageObject._menuTrigger);
    await MenuPageObject.openMenu();
  });

  it('Validate MenuItem "accessibilityRole" defaults to MenuItem "ControlType" element attribute.', async () => {
    // The popover is where we can find the a11y role of menu
    await expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem(MenuItem.First), Attribute.AccessibilityRole, MENUITEM_A11Y_ROLE),
    ).toBeTrue();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set MenuItem "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await MenuPageObject.compareAttribute(
        MenuPageObject.getMenuItem(MenuItem.First),
        Attribute.AccessibilityLabel,
        MENUITEM_ACCESSIBILITY_LABEL,
      ),
    ).toBeTrue();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set MenuItem "accessibilityLabel". Validate MenuItem "Name" element attribute defaults to current MenuItem label.', async () => {
    await expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem(MenuItem.Third), Attribute.AccessibilityLabel, MENUITEM_TEST_LABEL),
    ).toBeTrue();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Toggle Menu by click. Validate "ExpandCollapseState" element attribute correctly changes.', async () => {
    await expect(
      await MenuPageObject.compareAttribute(MenuPageObject._menuTrigger, Attribute.ExpandCollapseState, AttributeValue.expanded),
    ).toBeTrue();

    await MenuPageObject.closeMenu();

    await expect(
      await MenuPageObject.compareAttribute(MenuPageObject._menuTrigger, Attribute.ExpandCollapseState, AttributeValue.collapsed),
    ).toBeTrue();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
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
    await expect(await MenuPageObject.waitForMenuToOpen()).toBeTruthy();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Enter" on MenuTrigger. Validate Menu is opened by checking if MenuItems are visible.', async () => {
    await MenuPageObject.sendKeys(MenuPageObject._menuTrigger, [Keys.ENTER]);
    await expect(await MenuPageObject.waitForMenuToOpen()).toBeTruthy();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Space" on MenuTrigger -> Validate Menu is opened by checking if MenuItems are visible.', async () => {
    await MenuPageObject.sendKeys(MenuPageObject._menuTrigger, [Keys.SPACE]);
    await expect(await MenuPageObject.waitForMenuToOpen()).toBeTruthy();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Space", Press "Enter", and "Click" on MenuItem. Validate that onClick() callback fires correctly.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem(MenuItem.First), [Keys.SPACE]);
    await MenuPageObject.waitForItemCallbackToFire(1);
    await expect(await MenuPageObject.itemOnClickHasFired(1)).toBeTruthy('Space input failed to fire MenuItem onClick callback');

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem(MenuItem.First), [Keys.ENTER]);
    await MenuPageObject.waitForItemCallbackToFire(2);
    await expect(await MenuPageObject.itemOnClickHasFired(2)).toBeTruthy('Enter input failed to fire MenuItem onClick callback');

    await MenuPageObject.click(MenuPageObject.getMenuItem(MenuItem.First));
    await MenuPageObject.waitForItemCallbackToFire(3);
    await expect(await MenuPageObject.itemOnClickHasFired(3)).toBeTruthy('Click input failed to fire MenuItem onClick callback');

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Space", Press "Enter", and "Click" on disabled MenuItem. Validate that onClick() callback does not fire.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem(MenuItem.Second), [Keys.SPACE]);
    await MenuPageObject.waitForItemCallbackToFire(0);
    await expect(await MenuPageObject.itemOnClickHasFired(0)).toBeTruthy('Space input fired disabled MenuItem onClick callback');

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem(MenuItem.Second), [Keys.ENTER]);
    await MenuPageObject.waitForItemCallbackToFire(0);
    await expect(await MenuPageObject.itemOnClickHasFired(0)).toBeTruthy('Enter input fired disabled MenuItem onClick callback');

    await MenuPageObject.click(MenuPageObject.getMenuItem(MenuItem.Second));
    await MenuPageObject.waitForItemCallbackToFire(0);
    await expect(await MenuPageObject.itemOnClickHasFired(0)).toBeTruthy('Click input fired disabled MenuItem onClick callback');

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Up" + "Down" to navigate between MenuItems. Validate that focus switches correctly between MenuItems.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem(MenuItem.First), [Keys.DOWN]);
    await expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem(MenuItem.Second), Attribute.IsFocused, AttributeValue.true),
    ).toBeTrue();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem(MenuItem.Second), [Keys.UP]);
    await expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem(MenuItem.First), Attribute.IsFocused, AttributeValue.true),
    ).toBeTrue();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem(MenuItem.First), [Keys.UP]);
    await expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem(MenuItem.Fourth), Attribute.IsFocused, AttributeValue.true),
    ).toBeTrue();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Tab" to navigate between MenuItems. Validate that focus switches correctly between MenuItems.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem(MenuItem.Third), [Keys.TAB]);
    await expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem(MenuItem.Fourth), Attribute.IsFocused, AttributeValue.true),
    ).toBeTrue();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem(MenuItem.Fourth), [Keys.TAB]);
    await expect(
      await MenuPageObject.compareAttribute(MenuPageObject.getMenuItem(MenuItem.First), Attribute.IsFocused, AttributeValue.true),
    ).toBeTrue();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Escape" on MenuItem. Validate that Menu closes by checking if MenuItems are not visible.', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKeys(MenuPageObject.getMenuItem(MenuItem.First), [Keys.ESCAPE]);
    await expect(await MenuPageObject.menuIsExpanded()).toBeFalsy(
      'Expected the Menu to close, but its MenuItems are still displayed - the menu appears to still be open.',
    );

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });
});
