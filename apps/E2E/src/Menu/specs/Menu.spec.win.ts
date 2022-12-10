import NavigateAppPage from '../../common/NavigateAppPage';
import MenuPageObject, { MenuComponentSelector } from '../pages/MenuPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys, MENUITEM_A11Y_ROLE, AttributeValue } from '../../common/consts';
import { MENUITEM_TEST_LABEL } from '../../../../fluent-tester/src/TestComponents/Menu/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Menu Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
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
    await MenuPageObject.scrollToTestElement();
    await MenuPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    await MenuPageObject.openMenu();
  });

  it('Menu - Validate accessibilityRole of menu item is correct', async () => {
    await expect(await MenuPageObject.getMenuItemAccessibilityRole()).toEqual(MENUITEM_A11Y_ROLE);

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Menu - Do not set accessibilityLabel -> Default to MenuItem label', async () => {
    await expect(await MenuPageObject.getMenuItemAccessibilityLabel(MenuComponentSelector.ThirdMenuItem)).toEqual(MENUITEM_TEST_LABEL);

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Menu - Click menu -> ExpandCollapseState correctly changes', async () => {
    await expect(await MenuPageObject.getMenuExpandCollapseState()).toEqual(AttributeValue.expanded);

    await MenuPageObject.closeMenu();

    await expect(await MenuPageObject.getMenuExpandCollapseState()).toEqual(AttributeValue.collapsed);

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Menu Functional Testing', () => {
  /* Scrolls and waits for the Menu to be visible on the Test Page */
  beforeEach(async () => {
    await MenuPageObject.scrollToTestElement();
    await MenuPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    await MenuPageObject.resetTest();
  });

  it('Click MenuTrigger -> Validate Menu is opened by checking if MenuItems are visible', async () => {
    await MenuPageObject.click(MenuComponentSelector.MenuTrigger);
    await expect(await MenuPageObject.waitForMenuToOpen()).toBeTruthy();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Send "Enter" input to MenuTrigger -> Validate Menu is opened by checking if MenuItems are visible', async () => {
    await MenuPageObject.sendKey(MenuComponentSelector.MenuTrigger, Keys.ENTER);
    await expect(await MenuPageObject.waitForMenuToOpen()).toBeTruthy();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Send "Space" input to MenuTrigger -> Validate Menu is opened by checking if MenuItems are visible', async () => {
    await MenuPageObject.sendKey(MenuComponentSelector.MenuTrigger, Keys.SPACE);
    await expect(await MenuPageObject.waitForMenuToOpen()).toBeTruthy();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Space", Press "Enter", and "Click" on MenuItem -> Validate that onClick callback fires correctly', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKey(MenuComponentSelector.FirstMenuItem, Keys.SPACE);
    await MenuPageObject.waitForItemCallbackToFire(1);
    await expect(await MenuPageObject.itemOnClickHasFired(1)).toBeTruthy('Space input failed to fire MenuItem onClick callback');

    await MenuPageObject.sendKey(MenuComponentSelector.FirstMenuItem, Keys.ENTER);
    await MenuPageObject.waitForItemCallbackToFire(2);
    await expect(await MenuPageObject.itemOnClickHasFired(2)).toBeTruthy('Enter input failed to fire MenuItem onClick callback');

    await MenuPageObject.click(MenuComponentSelector.FirstMenuItem);
    await MenuPageObject.waitForItemCallbackToFire(3);
    await expect(await MenuPageObject.itemOnClickHasFired(3)).toBeTruthy('Click input failed to fire MenuItem onClick callback');

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Space", Press "Enter", and "Click" on disabled MenuItem -> Validate that onClick callback does not fire', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKey(MenuComponentSelector.SecondMenuItem, Keys.SPACE);
    await MenuPageObject.waitForItemCallbackToFire(0);
    await expect(await MenuPageObject.itemOnClickHasFired(0)).toBeTruthy('Space input fired disabled MenuItem onClick callback');

    await MenuPageObject.sendKey(MenuComponentSelector.SecondMenuItem, Keys.ENTER);
    await MenuPageObject.waitForItemCallbackToFire(0);
    await expect(await MenuPageObject.itemOnClickHasFired(0)).toBeTruthy('Enter input fired disabled MenuItem onClick callback');

    await MenuPageObject.click(MenuComponentSelector.SecondMenuItem);
    await MenuPageObject.waitForItemCallbackToFire(0);
    await expect(await MenuPageObject.itemOnClickHasFired(0)).toBeTruthy('Click input fired disabled MenuItem onClick callback');

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Up" + "Down" to navigate between MenuItems -> Validate that focus switches correctly between MenuItems', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKey(MenuComponentSelector.FirstMenuItem, Keys.DOWN);
    await expect(await MenuPageObject.componentIsFocused(MenuComponentSelector.SecondMenuItem)).toBeTruthy();

    await MenuPageObject.sendKey(MenuComponentSelector.SecondMenuItem, Keys.UP);
    await expect(await MenuPageObject.componentIsFocused(MenuComponentSelector.FirstMenuItem)).toBeTruthy();

    await MenuPageObject.sendKey(MenuComponentSelector.FirstMenuItem, Keys.UP);
    await expect(await MenuPageObject.componentIsFocused(MenuComponentSelector.FourthMenuItem)).toBeTruthy();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Tab" to navigate between MenuItems -> Validate that focus switches correctly between MenuItems', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKey(MenuComponentSelector.ThirdMenuItem, Keys.TAB);
    await expect(await MenuPageObject.componentIsFocused(MenuComponentSelector.FourthMenuItem)).toBeTruthy();

    await MenuPageObject.sendKey(MenuComponentSelector.FourthMenuItem, Keys.TAB);
    await expect(await MenuPageObject.componentIsFocused(MenuComponentSelector.FirstMenuItem)).toBeTruthy();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "Escape" on MenuItem -> Validate that Menu closes by checking if MenuItems are not visible', async () => {
    await MenuPageObject.openMenu();

    await MenuPageObject.sendKey(MenuComponentSelector.FirstMenuItem, Keys.ESCAPE);
    await expect(await MenuPageObject.menuIsExpanded()).toBeFalsy();

    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });
});
