import NavigateAppPage from '../../common/NavigateAppPage';
import AvatarPageObject from '../pages/AvatarPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Attribute, LINK_A11Y_ROLE, IMAGE_A11Y_ROLE } from '../../common/consts';
import { AVATAR_ACCESSIBILITY_LABEL, AVATAR_ACCESSIBILITY_LABEL_BY_NAME, AVATAR_ACCESSIBILITY_HINT } from '../consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Avatar Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Avatar test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToAvatarPage();
    await AvatarPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await AvatarPageObject.isPageLoaded()).toBeTruthy(AvatarPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
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

    await expect(await AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "name" prop without setting "accessibilityLabel". Validate "accessibilityLabel" value defaults to "{name}, available".', async () => {
    await expect(
      await AvatarPageObject.compareAttribute(
        AvatarPageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        AVATAR_ACCESSIBILITY_LABEL_BY_NAME,
      ),
    ).toBeTruthy();

    await expect(await AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityHint". Validate "accessibilityHint" value propagates to "HelpText" element attribute.', async () => {
    await expect(
      await AvatarPageObject.compareAttribute(AvatarPageObject._primaryComponent, Attribute.AccessibilityHint, AVATAR_ACCESSIBILITY_HINT),
    ).toBeTruthy();

    await expect(await AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Set "accessibilityRole" prop. Validate "accessibilityRole" value propagates to "ControlType" attribute.', async () => {
    await expect(
      await AvatarPageObject.compareAttribute(AvatarPageObject._primaryComponent, Attribute.AccessibilityRole, LINK_A11Y_ROLE),
    ).toBeTruthy();

    await expect(await AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Do NOT set "accessibilityRole". Validate "accessibilityRole" value defaults to "Image" ControlType.', async () => {
    await expect(
      await AvatarPageObject.compareAttribute(AvatarPageObject._secondaryComponent, Attribute.AccessibilityRole, IMAGE_A11Y_ROLE),
    ).toBeTruthy();

    await expect(await AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });
});
