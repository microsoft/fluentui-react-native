import NavigateAppPage from '../../common/NavigateAppPage';
import MenuButtonPageObject, { MenuButtonSelector } from '../pages/MenuButtonPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, MENUBUTTON_A11Y_ROLE, Keys } from '../../common/consts';
import {
  MENU_BUTTON_ACCESSIBILITY_LABEL,
  MENU_BUTTON_TEST_COMPONENT_LABEL,
} from '../../../../fluent-tester/src/TestComponents/MenuButton/consts';
import { ComponentSelector } from '../../common/BasePage';

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

/* This will be re-enabled with a MenuButton Bug is fixed. Currently in PR - "Integrating accessibilityLabel functionality for MenuButton #1117" */
describe('MenuButton Accessibility Testing', () => {
  /* Scrolls and waits for the MenuButton to be visible on the Test Page */
  beforeEach(async () => {
    await MenuButtonPageObject.scrollToTestElement();
    await MenuButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('MenuButton - Validate accessibilityRole is correct', async () => {
    await expect(await MenuButtonPageObject.getAccessibilityRole()).toEqual(MENUBUTTON_A11Y_ROLE);
    await expect(await MenuButtonPageObject.didAssertPopup()).toBeFalsy(MenuButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('MenuButton - Set accessibilityLabel', async () => {
    await expect(await MenuButtonPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(MENU_BUTTON_ACCESSIBILITY_LABEL);
    await expect(await MenuButtonPageObject.didAssertPopup()).toBeFalsy(MenuButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set accessibilityLabel -> Default to MenuButton label', async () => {
    await expect(await MenuButtonPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(MENU_BUTTON_TEST_COMPONENT_LABEL);
    await expect(await MenuButtonPageObject.didAssertPopup()).toBeFalsy(MenuButtonPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('MenuButton Functional Testing', () => {
  /* Scrolls and waits for the MenuButton to be visible on the Test Page */
  beforeEach(async () => {
    await MenuButtonPageObject.scrollToTestElement();
    await MenuButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await MenuButtonPageObject.sendKey(MenuButtonSelector.MenuButton, Keys.ESCAPE); // Reset MenuButton state for next test
  });

  it('Click on MenuButton and validate that the list of Menu Items open', async () => {
    /* Click on the MenuButton */
    await MenuButtonPageObject.clickComponent();
    await MenuButtonPageObject.waitForMenuItemsToOpen(PAGE_TIMEOUT);

    await expect(await MenuButtonPageObject.menuItemDisplayed()).toBeTruthy();
    await expect(await MenuButtonPageObject.didAssertPopup()).toBeFalsy(MenuButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Type "SPACE" to select the MenuButton and validate that the list of Menu Items open', async () => {
    /* Type a space on the MenuButton */
    await MenuButtonPageObject.sendKey(MenuButtonSelector.MenuButton, Keys.SPACE);
    await MenuButtonPageObject.waitForMenuItemsToOpen(PAGE_TIMEOUT);

    await expect(await MenuButtonPageObject.menuItemDisplayed()).toBeTruthy();
    await expect(await MenuButtonPageObject.didAssertPopup()).toBeFalsy(MenuButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  /* Runs after all tests. This ensures the MenuButton closes. If it stays open, the test driver won't be able to close the test app */
  afterAll(async () => {
    await MenuButtonPageObject.sendKey(MenuButtonSelector.MenuButton, Keys.ESCAPE);
  });
});
