import { Attribute, LINK_A11Y_ROLE, IMAGE_A11Y_ROLE } from '../../common/consts';
import { AVATAR_ACCESSIBILITY_LABEL, AVATAR_ACCESSIBILITY_LABEL_BY_NAME, AVATAR_ACCESSIBILITY_HINT } from '../consts';
import AvatarPageObject from '../pages/AvatarPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Avatar Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await AvatarPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Avatar test page', async () => {
    /* Click on component button to navigate to test page */
    expect(await AvatarPageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await AvatarPageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await AvatarPageObject.didAssertPopup())
      .withContext(AvatarPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});

describe('Avatar Accessibility Testing', () => {
  beforeEach(async () => {
    await AvatarPageObject.scrollToTestElement();
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" value propagates to "Name" element attribute.', async () => {
    await expect(
      await AvatarPageObject.compareAttribute(AvatarPageObject._primaryComponent, Attribute.AccessibilityLabel, AVATAR_ACCESSIBILITY_LABEL),
    ).toBeTruthy();
  });

  it('Set "name" prop without setting "accessibilityLabel". Validate "accessibilityLabel" value defaults to "{name}, available".', async () => {
    await expect(
      await AvatarPageObject.compareAttribute(
        AvatarPageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        AVATAR_ACCESSIBILITY_LABEL_BY_NAME,
      ),
    ).toBeTruthy();
  });

  it('Set "accessibilityHint". Validate "accessibilityHint" value propagates to "HelpText" element attribute.', async () => {
    await expect(
      await AvatarPageObject.compareAttribute(AvatarPageObject._primaryComponent, Attribute.AccessibilityHint, AVATAR_ACCESSIBILITY_HINT),
    ).toBeTruthy();
  });

  it('Set "accessibilityRole" prop. Validate "accessibilityRole" propagates to "ControlType" element attribute.', async () => {
    await expect(
      await AvatarPageObject.compareAttribute(AvatarPageObject._primaryComponent, Attribute.AccessibilityRole, LINK_A11Y_ROLE),
    ).toBeTruthy();
  });

  it('Do NOT set "accessibilityRole". Validate "accessibilityRole" defaults to "ControlType.Image".', async () => {
    await expect(
      await AvatarPageObject.compareAttribute(AvatarPageObject._secondaryComponent, Attribute.AccessibilityRole, IMAGE_A11Y_ROLE),
    ).toBeTruthy();
  });
});
