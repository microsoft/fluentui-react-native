import { BUTTON_ACCESSIBILITY_LABEL, BUTTON_TEST_COMPONENT_LABEL } from '../../ButtonLegacy/consts';
import { BUTTON_A11Y_ROLE, Keys, Attribute } from '../../common/consts';
import ButtonV1PageObject from '../pages/ButtonV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('ButtonV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await ButtonV1PageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to ButtonV1 test page', async () => {
    /* Click on component button to navigate to test page */
    expect(await ButtonV1PageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await ButtonV1PageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('ButtonV1 Accessibility Testing', () => {
  beforeEach(async () => {
    await ButtonV1PageObject.scrollToTestElement();
  });

  it('Validate "accessibilityRole" value defaults to "ControlType.Button".', async () => {
    await expect(
      await ButtonV1PageObject.compareAttribute(ButtonV1PageObject._primaryComponent, Attribute.AccessibilityRole, BUTTON_A11Y_ROLE),
    ).toBeTruthy();
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await ButtonV1PageObject.compareAttribute(
        ButtonV1PageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_ACCESSIBILITY_LABEL,
      ),
    ).toBeTruthy();
  });

  it('Do NOT set "accessibilityLabel" prop. Validate "Name" element attribute defaults to the button label.', async () => {
    await expect(
      await ButtonV1PageObject.compareAttribute(
        ButtonV1PageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_TEST_COMPONENT_LABEL,
      ),
    ).toBeTruthy();
  });
});

describe('ButtonV1 Functional Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonV1PageObject.scrollToTestElement();
  });

  afterEach(async () => {
    await ButtonV1PageObject.resetTest();
  });

  it('Click primary button. Validate onClick() callback was fired.', async () => {
    await ButtonV1PageObject.click(ButtonV1PageObject._primaryComponent);
    await expect(
      await ButtonV1PageObject.waitForOnClickCallbackToFire(`The primary button failed to fire an onClick callback with a mouse click.`),
    ).toBeTruthy();

    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Type "Enter" on primary button. Validate onClick() callback was fired.', async () => {
    await ButtonV1PageObject.sendKeys(ButtonV1PageObject._primaryComponent, [Keys.ENTER]);
    await expect(
      await ButtonV1PageObject.waitForOnClickCallbackToFire(
        `The primary button failed to fire an onClick callback with an enter keypress.`,
      ),
    ).toBeTruthy();

    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Type "Space" on primary button. Validate onClick() callback was fired.', async () => {
    await ButtonV1PageObject.sendKeys(ButtonV1PageObject._primaryComponent, [Keys.SPACE]);

    await expect(
      await ButtonV1PageObject.waitForOnClickCallbackToFire(`The primary button failed to fire an onClick callback with a space keypress.`),
    ).toBeTruthy();

    await expect(await ButtonV1PageObject.didAssertPopup()).toBeFalsy(ButtonV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
