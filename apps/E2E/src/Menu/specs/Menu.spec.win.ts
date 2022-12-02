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
    await expect(await MenuPageObject.getMenuItemAccessibilityLabel(MenuComponentSelector.TertiaryComponent)).toEqual(MENUITEM_TEST_LABEL);
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
});
