import { MENUBUTTON_A11Y_ROLE, Keys, Attribute } from '../../common/consts';
import { MENU_BUTTON_ACCESSIBILITY_LABEL, MENU_BUTTON_TEST_COMPONENT_LABEL } from '../consts';
import MenuButtonLegacyPageObject from '../pages/MenuButtonLegacyPageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('MenuButton Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await MenuButtonLegacyPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to MenuButton test page', async () => {
    expect(await MenuButtonLegacyPageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await MenuButtonLegacyPageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await MenuButtonLegacyPageObject.didAssertPopup()).toBeFalsy(MenuButtonLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('MenuButton Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the MenuButton to be visible on the Test Page */
  beforeEach(async () => {
    await MenuButtonLegacyPageObject.scrollToTestElement(await MenuButtonLegacyPageObject._firstMenuButton);
  });

  it('Validate "accessibilityRole" value defaults to "ControlType.Button".', async () => {
    await expect(
      await MenuButtonLegacyPageObject.compareAttribute(
        MenuButtonLegacyPageObject._firstMenuButton,
        Attribute.AccessibilityRole,
        MENUBUTTON_A11Y_ROLE,
      ),
    ).toBeTruthy();
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await MenuButtonLegacyPageObject.compareAttribute(
        MenuButtonLegacyPageObject._firstMenuButton,
        Attribute.AccessibilityLabel,
        MENU_BUTTON_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Do not set "accessibilityLabel". Validate "Name" element attribute defaults to MenuButton label.', async () => {
    await expect(
      await MenuButtonLegacyPageObject.compareAttribute(
        MenuButtonLegacyPageObject._secondMenuButton,
        Attribute.AccessibilityLabel,
        MENU_BUTTON_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();
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
