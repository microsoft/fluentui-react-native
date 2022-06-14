import NavigateAppPage from '../../common/NavigateAppPage.win';
import AvatarPageObject from '../pages/AvatarPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import {
  JSAVATAR_ACCESSIBILITY_LABEL,
  JSAVATAR_ACCESSIBILITY_LABEL_BY_NAME,
  JSAVATAR_ACCESSIBILITY_HINT,
  JSAVATAR_ACCESSIBILITY_ROLE,
  ACCESSIBILITY_LABEL_ATTR,
  ACCESSIBILITY_HINT_ATTRIBUTE,
  ACCESSIBILITY_ROLE_ATTRIBUTE,
  ACCESSIBILITY_ROLE_IMAGE,
  ACCESSIBILITY_ROLE_LINK,
} from '../../../FluentTester/TestComponents/Avatar/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Avatar Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Avatar test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    AvatarPageObject.scrollToComponentButton();
    AvatarPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToAvatarPage();
    AvatarPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(AvatarPageObject.isPageLoaded()).toBeTruthy(AvatarPageObject.ERRORMESSAGE_PAGELOAD);
    expect(AvatarPageObject.didAssertPopup()).toBeFalsy(AvatarPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Avatar Accessibility Testing', () => {
  beforeEach(() => {
    AvatarPageObject.scrollToTestElement();
    AvatarPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });
  it('Validate accessibilityLabel', () => {
    expect(AvatarPageObject.getPrimaryComponentAttribute(ACCESSIBILITY_LABEL_ATTR)).toEqual(JSAVATAR_ACCESSIBILITY_LABEL);
  });
  it('Validate accessibilityLabel from `name` prop', () => {
    expect(AvatarPageObject.getSecondaryComponentAttribute(ACCESSIBILITY_LABEL_ATTR)).toEqual(JSAVATAR_ACCESSIBILITY_LABEL_BY_NAME);
  });
  it('Validate accessibilityHint', () => {
    expect(AvatarPageObject.getPrimaryComponentAttribute(ACCESSIBILITY_HINT_ATTRIBUTE)).toEqual(JSAVATAR_ACCESSIBILITY_HINT);
  });
  it('Validate accessibilityRole', () => {
    expect(AvatarPageObject.getPrimaryComponentAttribute(ACCESSIBILITY_ROLE_ATTRIBUTE)).toEqual(ACCESSIBILITY_ROLE_LINK);
  });
  it('Validate default accessibilityRole', () => {
    expect(AvatarPageObject.getSecondaryComponentAttribute(ACCESSIBILITY_ROLE_ATTRIBUTE)).toEqual(ACCESSIBILITY_ROLE_IMAGE);
  });
});
