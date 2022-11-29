import NavigateAppPage from '../../common/NavigateAppPage';
import AvatarPageObject from '../pages/AvatarPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import {
  AVATAR_ACCESSIBILITY_LABEL,
  AVATAR_ACCESSIBILITY_LABEL_BY_NAME,
  AVATAR_ACCESSIBILITY_HINT,
  ACCESSIBILITY_LABEL_ATTR,
  ACCESSIBILITY_HINT_ATTRIBUTE,
  ACCESSIBILITY_ROLE_ATTRIBUTE,
  ACCESSIBILITY_ROLE_IMAGE,
  ACCESSIBILITY_ROLE_LINK,
} from '../../../../fluent-tester/src/TestComponents/Avatar/consts';

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
    await AvatarPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Validate accessibilityLabel', async () => {
    await expect(await AvatarPageObject.getPrimaryComponentAttribute(ACCESSIBILITY_LABEL_ATTR)).toEqual(AVATAR_ACCESSIBILITY_LABEL);
    await expect(await AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate accessibilityLabel from `name` prop', async () => {
    await expect(await AvatarPageObject.getSecondaryComponentAttribute(ACCESSIBILITY_LABEL_ATTR)).toEqual(
      AVATAR_ACCESSIBILITY_LABEL_BY_NAME,
    );
    await expect(await AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate accessibilityHint', async () => {
    await expect(await AvatarPageObject.getPrimaryComponentAttribute(ACCESSIBILITY_HINT_ATTRIBUTE)).toEqual(AVATAR_ACCESSIBILITY_HINT);
    await expect(await AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate accessibilityRole', async () => {
    await expect(await AvatarPageObject.getPrimaryComponentAttribute(ACCESSIBILITY_ROLE_ATTRIBUTE)).toEqual(ACCESSIBILITY_ROLE_LINK);
    await expect(await AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate default accessibilityRole', async () => {
    await expect(await AvatarPageObject.getSecondaryComponentAttribute(ACCESSIBILITY_ROLE_ATTRIBUTE)).toEqual(ACCESSIBILITY_ROLE_IMAGE);
    await expect(await AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });
});
