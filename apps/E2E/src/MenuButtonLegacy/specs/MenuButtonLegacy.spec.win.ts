import NavigateAppPage from '../../common/NavigateAppPage';
import MenuButtonLegacyPageObject, { MenuButtonSelector } from '../pages/MenuButtonLegacyPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, MENUBUTTON_A11Y_ROLE, Keys } from '../../common/consts';
import { MENU_BUTTON_ACCESSIBILITY_LABEL, MENU_BUTTON_TEST_COMPONENT_LABEL } from '../consts';
import { ComponentSelector } from '../../common/BasePage';

// Before testing begins, allow up to 60 seconds for app to open
describe('MenuButton Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to MenuButton Legacy test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToMenuButtonLegacyPage();
    await MenuButtonLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await MenuButtonLegacyPageObject.isPageLoaded()).toBeTruthy(MenuButtonLegacyPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await MenuButtonLegacyPageObject.didAssertPopup()).toBeFalsy(MenuButtonLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

/* This will be re-enabled with a MenuButton Bug is fixed. Currently in PR - "Integrating accessibilityLabel functionality for MenuButton #1117" */
describe('MenuButton Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the MenuButton to be visible on the Test Page */
  beforeEach(async () => {
    await MenuButtonLegacyPageObject.scrollToTestElement();
  });

  it('MenuButton - Validate accessibilityRole is correct', async () => {
    await expect(await MenuButtonLegacyPageObject.getAccessibilityRole()).toEqual(MENUBUTTON_A11Y_ROLE);
    await expect(await MenuButtonLegacyPageObject.didAssertPopup()).toBeFalsy(MenuButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('MenuButton - Set accessibilityLabel', async () => {
    await expect(await MenuButtonLegacyPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(
      MENU_BUTTON_ACCESSIBILITY_LABEL,
    );
    await expect(await MenuButtonLegacyPageObject.didAssertPopup()).toBeFalsy(MenuButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set accessibilityLabel -> Default to MenuButton label', async () => {
    await expect(await MenuButtonLegacyPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(
      MENU_BUTTON_TEST_COMPONENT_LABEL,
    );
    await expect(await MenuButtonLegacyPageObject.didAssertPopup()).toBeFalsy(MenuButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('MenuButton Legacy Functional Testing', () => {
  /* Scrolls and waits for the MenuButton to be visible on the Test Page */
  beforeEach(async () => {
    await MenuButtonLegacyPageObject.scrollToTestElement();

    await MenuButtonLegacyPageObject.sendKey(MenuButtonSelector.MenuButton, Keys.ESCAPE); // Reset MenuButton state for next test
  });

  it('Click on MenuButton and validate that the list of Menu Items open', async () => {
    /* Click on the MenuButton */
    await MenuButtonLegacyPageObject.clickComponent();
    await MenuButtonLegacyPageObject.waitForMenuItemsToOpen(PAGE_TIMEOUT);

    await expect(await MenuButtonLegacyPageObject.menuItemDisplayed()).toBeTruthy();
    await expect(await MenuButtonLegacyPageObject.didAssertPopup()).toBeFalsy(MenuButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Type "SPACE" to select the MenuButton and validate that the list of Menu Items open', async () => {
    /* Type a space on the MenuButton */
    await MenuButtonLegacyPageObject.sendKey(MenuButtonSelector.MenuButton, Keys.SPACE);
    await MenuButtonLegacyPageObject.waitForMenuItemsToOpen(PAGE_TIMEOUT);

    await expect(await MenuButtonLegacyPageObject.menuItemDisplayed()).toBeTruthy();
    await expect(await MenuButtonLegacyPageObject.didAssertPopup()).toBeFalsy(MenuButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  /* Runs after all tests. This ensures the MenuButton closes. If it stays open, the test driver won't be able to close the test app */
  afterAll(async () => {
    await MenuButtonLegacyPageObject.sendKey(MenuButtonSelector.MenuButton, Keys.ESCAPE);
  });
});
