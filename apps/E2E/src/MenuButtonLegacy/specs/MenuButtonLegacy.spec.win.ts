import NavigateAppPage from '../../common/NavigateAppPage';
import MenuButtonLegacyPageObject from '../pages/MenuButtonLegacyPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, MENUBUTTON_A11Y_ROLE, Keys, Attribute } from '../../common/consts';
import { MENU_BUTTON_ACCESSIBILITY_LABEL, MENU_BUTTON_TEST_COMPONENT_LABEL } from '../consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('MenuButton Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to MenuButton test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToMenuButtonLegacyPage();
    await MenuButtonLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await MenuButtonLegacyPageObject.isPageLoaded()).toBeTruthy(MenuButtonLegacyPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await MenuButtonLegacyPageObject.didAssertPopup()).toBeFalsy(MenuButtonLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('MenuButton Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the MenuButton to be visible on the Test Page */
  beforeEach(async () => {
    await MenuButtonLegacyPageObject.scrollToTestElement(await MenuButtonLegacyPageObject._firstMenuButton);
  });

  it('Validate "accessibilityRole" value defaults to Button "ControlType" element attribute.', async () => {
    await expect(
      await MenuButtonLegacyPageObject.compareAttribute(
        MenuButtonLegacyPageObject._firstMenuButton,
        Attribute.AccessibilityRole,
        MENUBUTTON_A11Y_ROLE,
      ),
    ).toBeTruthy();

    await expect(await MenuButtonLegacyPageObject.didAssertPopup()).toBeFalsy(MenuButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await MenuButtonLegacyPageObject.compareAttribute(
        MenuButtonLegacyPageObject._firstMenuButton,
        Attribute.AccessibilityLabel,
        MENU_BUTTON_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();

    await expect(await MenuButtonLegacyPageObject.didAssertPopup()).toBeFalsy(MenuButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set "accessibilityLabel". Validate "Name" element attribute defaults to MenuButton label.', async () => {
    await expect(
      await MenuButtonLegacyPageObject.compareAttribute(
        MenuButtonLegacyPageObject._secondMenuButton,
        Attribute.AccessibilityLabel,
        MENU_BUTTON_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();

    await expect(await MenuButtonLegacyPageObject.didAssertPopup()).toBeFalsy(MenuButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('MenuButton Legacy Functional Testing', () => {
  /* Scrolls and waits for the MenuButton to be visible on the Test Page */
  beforeEach(async () => {
    await MenuButtonLegacyPageObject.scrollToTestElement(await MenuButtonLegacyPageObject._firstMenuButton);

    await MenuButtonLegacyPageObject.sendKeys(MenuButtonLegacyPageObject._firstMenuButton, [Keys.ESCAPE]); // Reset MenuButton state for next test
  });

  it('Click on first MenuButton. Validate that its list of Menu Items display.', async () => {
    /* Click on the MenuButton */
    await MenuButtonLegacyPageObject.click(MenuButtonLegacyPageObject._firstMenuButton);

    await expect(
      await MenuButtonLegacyPageObject.waitForMenuItemToDisplay('Clicked MenuButton, but menu items failed to display before timeout.'),
    ).toBeTruthy();

    await expect(await MenuButtonLegacyPageObject.didAssertPopup()).toBeFalsy(MenuButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Type "SPACE" on first MenuButton. Validate that its list of Menu Items display.', async () => {
    /* Type a space on the MenuButton */
    await MenuButtonLegacyPageObject.sendKeys(MenuButtonLegacyPageObject._firstMenuButton, [Keys.SPACE]);

    await expect(
      await MenuButtonLegacyPageObject.waitForMenuItemToDisplay(
        'Pressed "SPACE" on MenuButton, but menu items failed to display before timeout.',
      ),
    ).toBeTruthy();

    await expect(await MenuButtonLegacyPageObject.didAssertPopup()).toBeFalsy(MenuButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  /* Runs after all tests. This ensures the MenuButton closes. If it stays open, the test driver won't be able to close the test app */
  afterAll(async () => {
    await MenuButtonLegacyPageObject.sendKeys(MenuButtonLegacyPageObject._firstMenuButton, [Keys.ESCAPE]);
  });
});
