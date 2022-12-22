import NavigateAppPage from '../../common/NavigateAppPage';
import ExperimentalMenuButtonPageObject from '../pages/ExperimentalMenuButtonPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, MENUBUTTON_A11Y_ROLE, Attribute } from '../../common/consts';
import {
  EXPERIMENTAL_MENU_BUTTON_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT_LABEL,
} from '../../../../fluent-tester/src/TestComponents/MenuButtonExperimental/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Experimental MenuButton Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Experimental MenuButton test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToExperimentalMenuButtonPage();
    await ExperimentalMenuButtonPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalMenuButtonPageObject.isPageLoaded()).toBeTruthy(ExperimentalMenuButtonPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ExperimentalMenuButtonPageObject.didAssertPopup()).toBeFalsy(ExperimentalMenuButtonPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Experimental MenuButton Accessibility Testing', () => {
  /* Scrolls and waits for the MenuButton to be visible on the Test Page */
  beforeEach(async () => {
    await ExperimentalMenuButtonPageObject.scrollToTestElement(await ExperimentalMenuButtonPageObject._firstMenuButton);
  });

  it('Validate accessibilityRole is correct', async () => {
    await expect(
      await ExperimentalMenuButtonPageObject.compareAttribute(
        ExperimentalMenuButtonPageObject._firstMenuButton,
        Attribute.AccessibilityRole,
        MENUBUTTON_A11Y_ROLE,
      ),
    ).toBeTrue();

    await expect(await ExperimentalMenuButtonPageObject.didAssertPopup()).toBeFalsy(ExperimentalMenuButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set accessibilityLabel -> Validate accessibilityLabel is correct', async () => {
    await expect(
      await ExperimentalMenuButtonPageObject.compareAttribute(
        ExperimentalMenuButtonPageObject._firstMenuButton,
        Attribute.AccessibilityLabel,
        EXPERIMENTAL_MENU_BUTTON_ACCESSIBILITY_LABEL,
      ),
    ).toBeTrue();

    await expect(await ExperimentalMenuButtonPageObject.didAssertPopup()).toBeFalsy(ExperimentalMenuButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do not set accessibilityLabel -> Validate accessibilityLabel defaults to MenuButton label', async () => {
    await expect(
      await ExperimentalMenuButtonPageObject.compareAttribute(
        ExperimentalMenuButtonPageObject._secondMenuButton,
        Attribute.AccessibilityLabel,
        EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT_LABEL,
      ),
    ).toBeTrue();

    await expect(await ExperimentalMenuButtonPageObject.didAssertPopup()).toBeFalsy(ExperimentalMenuButtonPageObject.ERRORMESSAGE_ASSERT);
  });
});
