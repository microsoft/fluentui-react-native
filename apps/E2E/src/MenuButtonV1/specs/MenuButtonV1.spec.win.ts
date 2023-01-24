import NavigateAppPage from '../../common/NavigateAppPage';
import MenuButtonV1PageObject from '../pages/MenuButtonV1PageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, MENUBUTTON_A11Y_ROLE } from '../../common/consts';
import { MENUBUTTONV1_ACCESSIBILITY_LABEL, MENUBUTTONV1_TEST_COMPONENT_LABEL } from '../consts';
import { ComponentSelector } from '../../common/BasePage';

// Before testing begins, allow up to 60 seconds for app to open
describe('MenuButtonV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to MenuButtonV1 test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToMenuButtonV1Page();
    await MenuButtonV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await MenuButtonV1PageObject.isPageLoaded()).toBeTruthy(MenuButtonV1PageObject.ERRORMESSAGE_PAGELOAD);

    await MenuButtonV1PageObject.enableE2ETesterMode();

    await expect(await MenuButtonV1PageObject.didAssertPopup()).toBeFalsy(MenuButtonV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

/* This will be re-enabled with a MenuButton Bug is fixed. Currently in PR - "Integrating accessibilityLabel functionality for MenuButton #1117" */
describe('MenuButtonV1 Accessibility Testing', () => {
  it('MenuButtonV1 - Validate accessibilityRole is correct', async () => {
    await MenuButtonV1PageObject.scrollToTestElement();

    await expect(await MenuButtonV1PageObject.getAccessibilityRole()).toEqual(MENUBUTTON_A11Y_ROLE);
    await expect(await MenuButtonV1PageObject.didAssertPopup()).toBeFalsy(MenuButtonV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  it('MenuButtonV1 - Set accessibilityLabel', async () => {
    await MenuButtonV1PageObject.scrollToTestElement();

    await expect(await MenuButtonV1PageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(MENUBUTTONV1_ACCESSIBILITY_LABEL);
    await expect(await MenuButtonV1PageObject.didAssertPopup()).toBeFalsy(MenuButtonV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });

  it('Do not set accessibilityLabel -> Default to MenuButtonV1 label', async () => {
    await MenuButtonV1PageObject.scrollToTestElement();

    await expect(await MenuButtonV1PageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(
      MENUBUTTONV1_TEST_COMPONENT_LABEL,
    );
    await expect(await MenuButtonV1PageObject.didAssertPopup()).toBeFalsy(MenuButtonV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
