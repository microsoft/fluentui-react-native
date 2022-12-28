import NavigateAppPage from '../../common/NavigateAppPage';
import MenuButtonPageObject, { MenuButtonSelector } from '../pages/MenuButtonPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, MENUBUTTON_A11Y_ROLE, Keys, Attribute } from '../../common/consts';
import {
  MENU_BUTTON_ACCESSIBILITY_LABEL,
  MENU_BUTTON_TEST_COMPONENT_LABEL,
} from '../../../../fluent-tester/src/TestComponents/MenuButton/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('MenuButton Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to MenuButton test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToMenuButtonPage();
    await MenuButtonPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await MenuButtonPageObject.isPageLoaded()).toBeTruthy(MenuButtonPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await MenuButtonPageObject.didAssertPopup()).toBeFalsy(MenuButtonPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('MenuButton Accessibility Testing', () => {
  /* Scrolls and waits for the MenuButton to be visible on the Test Page */
  beforeEach(async () => {
    await MenuButtonPageObject.scrollToTestElement(await MenuButtonPageObject._firstMenuButton);
  });

  it('Validate "accessibilityRole" value defaults to Button "ControlType" element attribute.', async () => {
    await expect(
      await MenuButtonPageObject.compareAttribute(MenuButtonPageObject._firstMenuButton, Attribute.AccessibilityRole, MENUBUTTON_A11Y_ROLE),
    ).toBeTrue();

    await expect(await MenuButtonPageObject.didAssertPopup()).toBeFalsy(MenuButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await MenuButtonPageObject.compareAttribute(
        MenuButtonPageObject._firstMenuButton,
        Attribute.AccessibilityLabel,
        MENU_BUTTON_ACCESSIBILITY_LABEL,
      ),
    ).toBeTrue();

    await expect(await MenuButtonPageObject.didAssertPopup()).toBeFalsy(MenuButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set "accessibilityLabel". Validate "Name" element attribute defaults to MenuButton label.', async () => {
    await expect(
      await MenuButtonPageObject.compareAttribute(
        MenuButtonPageObject._secondMenuButton,
        Attribute.AccessibilityLabel,
        MENU_BUTTON_TEST_COMPONENT_LABEL,
      ),
    ).toBeTrue();

    await expect(await MenuButtonPageObject.didAssertPopup()).toBeFalsy(MenuButtonPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('MenuButton Functional Testing', () => {
  /* Scrolls and waits for the MenuButton to be visible on the Test Page */
  beforeEach(async () => {
    await MenuButtonPageObject.scrollToTestElement(await MenuButtonPageObject._firstMenuButton);

    await MenuButtonPageObject.sendKeys(MenuButtonPageObject._firstMenuButton, [Keys.ESCAPE]); // Reset MenuButton state for next test
  });

  it('Click on first MenuButton. Validate that its list of Menu Items display.', async () => {
    /* Click on the MenuButton */
    await MenuButtonPageObject.click(MenuButtonPageObject._firstMenuButton);

    await expect(await MenuButtonPageObject.waitForMenuItemToDisplay()).toBeTruthy();

    await expect(await MenuButtonPageObject.didAssertPopup()).toBeFalsy(MenuButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Type "SPACE" on first MenuButton. Validate that its list of Menu Items display.', async () => {
    /* Type a space on the MenuButton */
    await MenuButtonPageObject.sendKeys(MenuButtonPageObject._firstMenuButton, [Keys.SPACE]);

    await expect(await MenuButtonPageObject.waitForMenuItemToDisplay()).toBeTruthy();

    await expect(await MenuButtonPageObject.didAssertPopup()).toBeFalsy(MenuButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  /* Runs after all tests. This ensures the MenuButton closes. If it stays open, the test driver won't be able to close the test app */
  afterAll(async () => {
    await MenuButtonPageObject.sendKeys(MenuButtonPageObject._firstMenuButton, [Keys.ESCAPE]);
  });
});
