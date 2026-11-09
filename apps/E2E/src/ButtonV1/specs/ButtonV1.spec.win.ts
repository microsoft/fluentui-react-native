import { desktopDescribe, desktopIt } from '@fluentui-react-native/desktop-test/jasmine';

import { BUTTON_ACCESSIBILITY_LABEL, BUTTON_TEST_COMPONENT_LABEL } from '../../ButtonLegacy/consts';
import { BUTTON_A11Y_ROLE, Keys, Attribute } from '../../common/consts';
import ButtonV1PageObject from '../pages/ButtonV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
desktopDescribe('ButtonV1 Testing Initialization', () => {
  desktopIt('Wait for app load', async () => {
    expect(await ButtonV1PageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  // Navigation scrolls the page list with the wheel whenever the page button is out of view.
  desktopIt('Click and navigate to ButtonV1 test page', { requires: ['click', 'wheel'] }, async () => {
    /* Click on component button to navigate to test page */
    expect(await ButtonV1PageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await ButtonV1PageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await ButtonV1PageObject.didAssertPopup())
      .withContext(ButtonV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy(); // Ensure no asserts popped up
  });
});

// The setup scrolls the test element into view, which can inject native wheel input, so this group is physical.
desktopDescribe('ButtonV1 Accessibility Testing', { requires: ['wheel'] }, () => {
  beforeEach(async () => {
    await ButtonV1PageObject.scrollToTestElement();
  });

  desktopIt('Validate "accessibilityRole" value defaults to "ControlType.Button".', async () => {
    await expect(
      await ButtonV1PageObject.compareAttribute(ButtonV1PageObject._primaryComponent, Attribute.AccessibilityRole, BUTTON_A11Y_ROLE),
    ).toBeTruthy();
  });

  desktopIt('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await ButtonV1PageObject.compareAttribute(
        ButtonV1PageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
  });

  desktopIt('Do NOT set "accessibilityLabel" prop. Validate "Name" element attribute defaults to the button label.', async () => {
    await expect(
      await ButtonV1PageObject.compareAttribute(
        ButtonV1PageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();
  });
});

desktopDescribe('ButtonV1 Functional Testing', { requires: ['wheel'] }, () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonV1PageObject.scrollToTestElement();
  });

  afterEach(async () => {
    await ButtonV1PageObject.resetTest();
  });

  desktopIt('Click primary button. Validate onClick() callback was fired.', { requires: ['physical-click'] }, async () => {
    await ButtonV1PageObject.click(ButtonV1PageObject._primaryComponent);
    await expect(
      await ButtonV1PageObject.waitForOnClickCallbackToFire(`The primary button failed to fire an onClick callback with a mouse click.`),
    ).toBeTruthy();

    await expect(await ButtonV1PageObject.didAssertPopup())
      .withContext(ButtonV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  desktopIt('Type "Enter" on primary button. Validate onClick() callback was fired.', { requires: ['keyboard'] }, async () => {
    await ButtonV1PageObject.sendKeys(ButtonV1PageObject._primaryComponent, [Keys.ENTER]);
    await expect(
      await ButtonV1PageObject.waitForOnClickCallbackToFire(
        `The primary button failed to fire an onClick callback with an enter keypress.`,
      ),
    ).toBeTruthy();

    await expect(await ButtonV1PageObject.didAssertPopup())
      .withContext(ButtonV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  desktopIt('Type "Space" on primary button. Validate onClick() callback was fired.', { requires: ['keyboard'] }, async () => {
    await ButtonV1PageObject.sendKeys(ButtonV1PageObject._primaryComponent, [Keys.SPACE]);

    await expect(
      await ButtonV1PageObject.waitForOnClickCallbackToFire(`The primary button failed to fire an onClick callback with a space keypress.`),
    ).toBeTruthy();

    await expect(await ButtonV1PageObject.didAssertPopup())
      .withContext(ButtonV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});
