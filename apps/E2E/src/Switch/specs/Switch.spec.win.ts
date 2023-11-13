import { BUTTON_A11Y_ROLE, Keys, Attribute } from '../../common/consts';
import { SWITCH_TEST_COMPONENT_LABEL, SWITCH_ACCESSIBILITY_LABEL } from '../consts';
import SwitchPageObject from '../pages/SwitchPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Switch Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await SwitchPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Switch test page', async () => {
    expect(await SwitchPageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await SwitchPageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Switch Accessibility Testing', () => {
  /* Scrolls and waits for the Switch to be visible on the Test Page */
  beforeEach(async () => {
    await SwitchPageObject.scrollToTestElement();
  });

  it('Validate "accessibilityRole" defaults to "ControlType.Button".', async () => {
    await expect(
      await SwitchPageObject.compareAttribute(SwitchPageObject._primaryComponent, Attribute.AccessibilityRole, BUTTON_A11Y_ROLE),
    ).toBeTruthy();
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await SwitchPageObject.compareAttribute(SwitchPageObject._primaryComponent, Attribute.AccessibilityLabel, SWITCH_ACCESSIBILITY_LABEL),
    ).toBeTruthy();
  });

  it('Do not set "accessibilityLabel" prop. Validate "Name" element attribute defaults to current Switch label.', async () => {
    await expect(
      await SwitchPageObject.compareAttribute(
        SwitchPageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        SWITCH_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();
  });
});

describe('Switch Functional Testing', () => {
  /* Scrolls and waits for the Switch to be visible on the Test Page */
  beforeEach(async () => {
    await SwitchPageObject.scrollToTestElement();

    await SwitchPageObject.setSwitchState(false);
  });

  it("Click on primary Switch. Validate it toggles correctly AND calls the user's onChange() callback.", async () => {
    /* Validate the Switch is initially toggled OFF */
    await expect(await SwitchPageObject.isSwitchChecked()).toBeFalsy(
      'Primary switch should be off on test start, but it was initially on.',
    );

    /* Click on the Switch to toggle on */
    await SwitchPageObject.click(SwitchPageObject._primaryComponent);

    /* Validate the Switch is toggled ON */
    await expect(
      await SwitchPageObject.waitForSwitchStateChange(true, 'Clicked the primary switch to turn it on, but it remained off.'),
    ).toBeTruthy();

    await expect(
      await SwitchPageObject.waitForOnChangeCallbackToFire(
        'Expected the switch onChange callback to fire by click, but the callback failed to fire.',
      ),
    ).toBeTruthy();

    await SwitchPageObject.click(SwitchPageObject._primaryComponent);

    /* Validate the Switch is toggled OFF */
    await expect(
      await SwitchPageObject.waitForSwitchStateChange(false, 'Clicked the primary switch to turn it off, but it remained on.'),
    ).toBeTruthy();

    await expect(await SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "ENTER" on primary Switch. Validate it toggles correctly AND calls the user\'s onChange() callback.', async () => {
    /* Validate the Switch is initially toggled OFF */
    await expect(await SwitchPageObject.isSwitchChecked()).toBeFalsy(
      'Primary switch should be off on test start, but it was initially on.',
    );

    /* Presses "Enter" to select the Switch */
    await SwitchPageObject.sendKeys(SwitchPageObject._primaryComponent, [Keys.ENTER]);

    /* Validate the Switch is toggled ON */
    await expect(
      await SwitchPageObject.waitForSwitchStateChange(true, 'Pressed "ENTER" on the primary switch to turn it on, but it remained off.'),
    ).toBeTruthy();

    await expect(
      await SwitchPageObject.waitForOnChangeCallbackToFire(
        'Expected the switch onChange callback to fire by "ENTER" input, but the callback failed to fire.',
      ),
    ).toBeTruthy();

    await SwitchPageObject.sendKeys(SwitchPageObject._primaryComponent, [Keys.ENTER]);

    /* Validate the Switch is toggled OFF */
    await expect(
      await SwitchPageObject.waitForSwitchStateChange(false, 'Pressed "ENTER" on the primary switch to turn it off, but it remained on.'),
    ).toBeTruthy();

    await expect(await SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Press "SPACE" on primary Switch. Validate it toggles correctly AND calls the user\'s onChange() callback.', async () => {
    /* Validate the Switch is initially toggled OFF */
    await expect(await SwitchPageObject.isSwitchChecked()).toBeFalsy(
      'Primary switch should be off on test start, but it was initially on.',
    );

    /* Presses "SPACE" to select the Switch */
    await SwitchPageObject.sendKeys(SwitchPageObject._primaryComponent, [Keys.SPACE]);

    /* Validate the Switch is toggled ON */
    await expect(
      await SwitchPageObject.waitForSwitchStateChange(true, 'Pressed "SPACE" on the primary switch to turn it on, but it remained off.'),
    ).toBeTruthy();

    await expect(
      await SwitchPageObject.waitForOnChangeCallbackToFire(
        'Expected the switch onChange callback to fire by "SPACE" input, but the callback failed to fire.',
      ),
    ).toBeTruthy();

    await SwitchPageObject.sendKeys(SwitchPageObject._primaryComponent, [Keys.SPACE]);

    /* Validate the Switch is toggled OFF */
    await expect(
      await SwitchPageObject.waitForSwitchStateChange(false, 'Pressed "SPACE" on the primary switch to turn it off, but it remained on.'),
    ).toBeTruthy();

    await expect(await SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });
});
