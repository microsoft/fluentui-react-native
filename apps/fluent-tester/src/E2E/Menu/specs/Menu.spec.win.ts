import NavigateAppPage from '../../common/NavigateAppPage.win';
import MenuPageObject, { MenuComponentSelector } from '../pages/MenuPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE, Keys, MENUITEM_A11Y_ROLE, MENU_A11Y_ROLE } from '../../common/consts';
import { MENUITEM_ACCESSIBILITY_LABEL, MENUITEM_TEST_LABEL } from 'src/FluentTester/TestComponents/Menu';

// Before testing begins, allow up to 60 seconds for app to open
describe('Experimental Button Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Button test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    MenuPageObject.scrollToComponentButton();
    MenuPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToMenuPage();
    MenuPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(MenuPageObject.isPageLoaded()).toBeTruthy(MenuPageObject.ERRORMESSAGE_PAGELOAD);
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Experimental Button Functional Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(() => {
    MenuPageObject.scrollToTestElement();
    MenuPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Validate OnOpenChange() callback was fired -> Click', () => {
    MenuPageObject.clickComponent();
    expect(MenuPageObject.didMenuOpen()).toBeTruthy();
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);

    MenuPageObject.clickComponent();
    expect(MenuPageObject.didMenuClose()).toBeTruthy();
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate OnOpenChange() callback was fired -> Type "Enter"', () => {
    MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.Enter);
    expect(MenuPageObject.didMenuOpen()).toBeTruthy();
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);

    MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.Enter);
    expect(MenuPageObject.didMenuClose()).toBeTruthy();
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate OnOpenChange() callback was fired -> Type "Spacebar"', () => {
    MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.Spacebar);
    expect(MenuPageObject.didMenuOpen()).toBeTruthy();
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);

    MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.Spacebar);
    expect(MenuPageObject.didMenuClose()).toBeTruthy();
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Experimental Button Accessibility Testing', () => {
  it('Experimental Button - Validate accessibilityRole of menu item is correct', () => {
    MenuPageObject.scrollToTestElement();
    MenuPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.Enter);
    expect(MenuPageObject.didMenuOpen()).toBeTruthy();
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);

    expect(MenuPageObject.getMenuItemAccessibilityRole()).toEqual(MENUITEM_A11Y_ROLE);
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);

    MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.Enter);
  });

  it('Experimental Button - Validate accessibilityRole of menu is correct', () => {
    MenuPageObject.scrollToTestElement();
    MenuPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.Enter);
    expect(MenuPageObject.didMenuOpen()).toBeTruthy();
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);

    expect(MenuPageObject.getMenuAccessibilityRole()).toEqual(MENU_A11Y_ROLE);
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);

    MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.Enter);
  });

  it('Experimental Button - Set accessibilityLabel', () => {
    MenuPageObject.scrollToTestElement();
    MenuPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.Enter);
    expect(MenuPageObject.didMenuOpen()).toBeTruthy();
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);

    expect(MenuPageObject.getMenuItemAccessibilityLabel(MenuComponentSelector.SecondaryComponent)).toEqual(MENUITEM_ACCESSIBILITY_LABEL);
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);

    MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.Enter);
  });

  it('Experimental Button - Do not set accessibilityLabel -> Default to Button label', () => {
    MenuPageObject.scrollToTestElement();
    MenuPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.Enter);
    expect(MenuPageObject.didMenuOpen()).toBeTruthy();
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);

    expect(MenuPageObject.getMenuItemAccessibilityLabel(MenuComponentSelector.TertiaryComponent)).toEqual(MENUITEM_TEST_LABEL);
    expect(MenuPageObject.didAssertPopup()).toBeFalsy(MenuPageObject.ERRORMESSAGE_ASSERT);

    MenuPageObject.sendKey(MenuComponentSelector.PrimaryComponent, Keys.Enter);
  });
});
