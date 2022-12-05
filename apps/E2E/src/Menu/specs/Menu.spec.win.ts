import NavigateAppPage from '../../common/NavigateAppPage';
import MenuPageObject, { MenuComponentSelector } from '../pages/MenuPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys, MENUITEM_A11Y_ROLE, ExpandCollapseState } from '../../common/consts';
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
  beforeEach(async () => {
    await MenuPageObject.scrollToTestElement();
    await MenuPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    await MenuPageObject.resetTest();
  });

  it('Menu - Validate accessibilityRole of menu item is correct', async () => {
    await MenuPageObject.clickComponent();
    await expect(await MenuPageObject.getMenuItemAccessibilityRole()).toEqual(MENUITEM_A11Y_ROLE);
    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Menu - Do not set accessibilityLabel -> Default to MenuItem label', async () => {
    await MenuPageObject.clickComponent();
    await expect(await MenuPageObject.getMenuItemAccessibilityLabel(MenuPageObject.getItemSelector(3))).toEqual(MENUITEM_TEST_LABEL);
    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Menu - Click menu -> ExpandCollapseState correctly changes', async () => {
    await MenuPageObject.clickComponent();
    await expect(await MenuPageObject.getMenuExpandCollapseState()).toEqual(ExpandCollapseState.EXPANDED);
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

  // menu opens

  it('Validate OnOpenChange() callback was fired -> Click', async () => {
    await MenuPageObject.clickComponent();
    await expect(await MenuPageObject.didMenuOpen()).toBeTruthy();
    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate OnOpenChange() callback was fired -> Type "Enter"', async () => {
    await MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.ENTER);
    await expect(await MenuPageObject.didMenuOpen()).toBeTruthy();
    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate OnOpenChange() callback was fired -> Type "SPACE"', async () => {
    await MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.SPACE);
    await expect(await MenuPageObject.didMenuOpen()).toBeTruthy();
    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  // menu item activation (onClick callback)

  it('Validate MenuItem onClick() callback fired -> Click', async () => {
    // open menu
    await MenuPageObject.clickComponent();
    await MenuPageObject.waitForMenuToOpen();
    // fire callback
    await MenuPageObject.clickComponent(MenuPageObject.getItemSelector(1));
    await MenuPageObject.waitForItemCallbackToFire();
    await expect(await MenuPageObject.didItemCallbackFire()).toBeTruthy();
    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate MenuItem onClick() callback fired -> Press Enter', async () => {
    // open menu
    await MenuPageObject.clickComponent();
    await MenuPageObject.waitForMenuToOpen();
    // fire callback
    await MenuPageObject.sendKey(MenuPageObject.getItemSelector(1), Keys.ENTER);
    await MenuPageObject.waitForItemCallbackToFire();
    await expect(await MenuPageObject.didItemCallbackFire()).toBeTruthy();
    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate MenuItem onClick() callback fired -> Press Space', async () => {
    // open menu
    await MenuPageObject.clickComponent();
    await MenuPageObject.waitForMenuToOpen();
    // fire callback
    await MenuPageObject.sendKey(MenuPageObject.getItemSelector(1), Keys.SPACE);
    await MenuPageObject.waitForItemCallbackToFire();
    await expect(await MenuPageObject.didItemCallbackFire()).toBeTruthy();
    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  // menu navigation

  it('Validate MenuItem navigation works correctly -> Press Up + Down', async () => {
    // open menu
    await MenuPageObject.clickComponent();
    await MenuPageObject.waitForMenuToOpen();
    // send key inputs to items
    await MenuPageObject.sendKey(MenuPageObject.getItemSelector(1), Keys.DOWN);
    await expect(await MenuPageObject.itemIsFocused(2)).toBeTruthy();
    await MenuPageObject.sendKey(MenuPageObject.getItemSelector(2), Keys.UP);
    await expect(await MenuPageObject.itemIsFocused(1)).toBeTruthy();
    await MenuPageObject.sendKey(MenuPageObject.getItemSelector(1), Keys.UP);
    await expect(await MenuPageObject.itemIsFocused(4)).toBeTruthy();
    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate MenuItem navigation works correctly -> Press Tab', async () => {
    // open menu
    await MenuPageObject.clickComponent();
    await MenuPageObject.waitForMenuToOpen();
    // send key inputs to items
    await MenuPageObject.sendKey(MenuPageObject.getItemSelector(3), Keys.TAB);
    await expect(await MenuPageObject.itemIsFocused(4)).toBeTruthy();
    await MenuPageObject.sendKey(MenuPageObject.getItemSelector(4), Keys.TAB);
    await expect(await MenuPageObject.itemIsFocused(1)).toBeTruthy();
    await expect(await MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  // Esc on MenuItem to close

  it('Validate Menu closes -> Press ESC on MenuItem', async () => {
    // open menu
    await MenuPageObject.clickComponent();
    await MenuPageObject.waitForMenuToOpen();
    // send key inputs to items
    await MenuPageObject.sendKey(MenuPageObject.getItemSelector(1), Keys.ESCAPE);
    await expect(await MenuPageObject.menuIsExpanded()).toBeFalsy();
  });
});
