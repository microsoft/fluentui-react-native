import { MENUBUTTON_A11Y_ROLE, Attribute } from '../../common/consts';
import { MENUBUTTONV1_ACCESSIBILITY_LABEL, MENUBUTTONV1_TEST_COMPONENT_LABEL } from '../consts';
import MenuButtonV1PageObject from '../pages/MenuButtonV1PageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('MenuButtonV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await MenuButtonV1PageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to MenuButtonV1 test page', async () => {
    expect(await MenuButtonV1PageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await MenuButtonV1PageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await MenuButtonV1PageObject.didAssertPopup()).toBeFalsy(MenuButtonV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

/* This will be re-enabled with a MenuButton Bug is fixed. Currently in PR - "Integrating accessibilityLabel functionality for MenuButton #1117" */
describe('MenuButtonV1 Accessibility Testing', () => {
  /* Scrolls and waits for the MenuButton to be visible on the Test Page */
  beforeEach(async () => {
    await MenuButtonV1PageObject.scrollToTestElement(await MenuButtonV1PageObject._firstMenuButton);
  });

  it('Validate "accessibilityRole" value defaults to "ControlType.Button".', async () => {
    await expect(
      await MenuButtonV1PageObject.compareAttribute(
        MenuButtonV1PageObject._firstMenuButton,
        Attribute.AccessibilityRole,
        MENUBUTTON_A11Y_ROLE,
      ),
    ).toBeTruthy();
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await MenuButtonV1PageObject.compareAttribute(
        MenuButtonV1PageObject._firstMenuButton,
        Attribute.AccessibilityLabel,
        MENUBUTTONV1_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Do not set "accessibilityLabel". Validate "Name" element attribute defaults to MenuButton label.', async () => {
    await expect(
      await MenuButtonV1PageObject.compareAttribute(
        MenuButtonV1PageObject._secondMenuButton,
        Attribute.AccessibilityLabel,
        MENUBUTTONV1_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();
  });
});
