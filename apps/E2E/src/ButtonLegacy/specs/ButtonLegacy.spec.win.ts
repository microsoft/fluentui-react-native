import { BUTTON_A11Y_ROLE, Keys, Attribute } from '../../common/consts';
import { BUTTON_ACCESSIBILITY_LABEL_DEPRECATED, BUTTON_TEST_COMPONENT_LABEL_DEPRECATED } from '../consts';
import ButtonLegacyPageObject from '../pages/ButtonLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await ButtonLegacyPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Button Legacy test page', async () => {
    /* Click on component button to navigate to test page */
    expect(await ButtonLegacyPageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await ButtonLegacyPageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Button Legacy Accessibility Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonLegacyPageObject.scrollToTestElement();
  });

  it('Validate "accessibilityRole" defaults to "ControlType.Button".', async () => {
    await expect(
      await ButtonLegacyPageObject.compareAttribute(
        ButtonLegacyPageObject._primaryComponent,
        Attribute.AccessibilityRole,
        BUTTON_A11Y_ROLE,
      ),
    ).toBeTruthy();
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await ButtonLegacyPageObject.compareAttribute(
        ButtonLegacyPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_ACCESSIBILITY_LABEL_DEPRECATED,
      ),
    ).toBeTruthy();
  });

  it('Do NOT set "accessibilityLabel" prop. Validate "Name" element attribute defaults to the button label.', async () => {
    await expect(
      await ButtonLegacyPageObject.compareAttribute(
        ButtonLegacyPageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_TEST_COMPONENT_LABEL_DEPRECATED,
      ),
    ).toBeTruthy();
  });
});

describe('Button Legacy Functional Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonLegacyPageObject.scrollToTestElement();
  });

  afterEach(async () => {
    await ButtonLegacyPageObject.resetTest();
  });

  it('Click primary button. Validate onClick() callback was fired.', async () => {
    await ButtonLegacyPageObject.click(ButtonLegacyPageObject._primaryComponent);
    await expect(
      await ButtonLegacyPageObject.didOnClickCallbackFire('Clicking on the primary button failed to fire the onClick() callback.'),
    ).toBeTruthy();

    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Type "Enter" on primary button. Validate onClick() callback was fired.', async () => {
    await ButtonLegacyPageObject.sendKeys(ButtonLegacyPageObject._primaryComponent, [Keys.ENTER]);
    await expect(
      await ButtonLegacyPageObject.didOnClickCallbackFire(
        "Pressing the 'Enter' key on the primary button failed to fire the onClick() callback.",
      ),
    ).toBeTruthy();
    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Type "Space" on primary button. Validate onClick() callback was fired.', async () => {
    await ButtonLegacyPageObject.sendKeys(ButtonLegacyPageObject._primaryComponent, [Keys.SPACE]);
    await expect(
      await ButtonLegacyPageObject.didOnClickCallbackFire(
        "Pressing the 'Space' key on the primary button failed to fire the onClick() callback.",
      ),
    ).toBeTruthy();

    await expect(await ButtonLegacyPageObject.didAssertPopup()).toBeFalsy(ButtonLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});
