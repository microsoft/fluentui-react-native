import NavigateAppPage from '../../common/NavigateAppPage';
import ExperimentalMenuButtonPageObject from '../pages/ExperimentalMenuButtonPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, MENUBUTTON_A11Y_ROLE } from '../../common/consts';
import {
  EXPERIMENTAL_MENU_BUTTON_ACCESSIBILITY_LABEL,
  EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT_LABEL,
} from '../../../../fluent-tester/src/TestComponents/MenuButtonExperimental/consts';
import { ComponentSelector } from '../../common/BasePage';

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

/* This will be re-enabled with a MenuButton Bug is fixed. Currently in PR - "Integrating accessibilityLabel functionality for MenuButton #1117" */
describe('Experimental MenuButton Accessibility Testing', () => {
  it('Experimental MenuButton - Validate accessibilityRole is correct', async () => {
    await ExperimentalMenuButtonPageObject.scrollToTestElement();
    await ExperimentalMenuButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalMenuButtonPageObject.getAccessibilityRole()).toEqual(MENUBUTTON_A11Y_ROLE);
    await expect(await ExperimentalMenuButtonPageObject.didAssertPopup()).toBeFalsy(ExperimentalMenuButtonPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  it('Experimental MenuButton - Set accessibilityLabel', async () => {
    await ExperimentalMenuButtonPageObject.scrollToTestElement();
    await ExperimentalMenuButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalMenuButtonPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(
      EXPERIMENTAL_MENU_BUTTON_ACCESSIBILITY_LABEL,
    );
    await expect(await ExperimentalMenuButtonPageObject.didAssertPopup()).toBeFalsy(ExperimentalMenuButtonPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  it('Do not set accessibilityLabel -> Default to Experimental MenuButton label', async () => {
    await ExperimentalMenuButtonPageObject.scrollToTestElement();
    await ExperimentalMenuButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalMenuButtonPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(
      EXPERIMENTAL_MENU_BUTTON_TEST_COMPONENT_LABEL,
    );
    await expect(await ExperimentalMenuButtonPageObject.didAssertPopup()).toBeFalsy(ExperimentalMenuButtonPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
