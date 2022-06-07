import NavigateAppPage from '../../common/NavigateAppPage.win';
import AvatarPageObject, { AvatarComponentSelector } from '../pages/AvatarPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import { ComponentSelector } from '../../common/BasePage.win';
import {
  JSAVATAR_ACCESSIBILITY_LABEL,
  JSAVATAR_ACCESSIBILITY_LABEL_BY_NAME,
  JSAVATAR_ACCESSIBILITY_HINT,
  JSAVATAR_ACCESSIBILITY_ROLE,
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
    expect(AvatarPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(JSAVATAR_ACCESSIBILITY_LABEL);
  });
  it('Validate accessibilityLabel from `name` prop', () => {
    expect(AvatarPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(JSAVATAR_ACCESSIBILITY_LABEL_BY_NAME);
  });
  it('Validate accessibilityHint', () => {
    expect(AvatarPageObject.getAvatarAccessibilityHint(AvatarComponentSelector.PrimaryComponent)).toEqual(JSAVATAR_ACCESSIBILITY_HINT);
  });
  it('Validate accessibilityRole', () => {
    expect(AvatarPageObject.getAvatarAccessibilityRole(AvatarComponentSelector.PrimaryComponent)).toEqual(JSAVATAR_ACCESSIBILITY_ROLE);
  });
  it('Validate default accessibilityRole', () => {
    expect(AvatarPageObject.getAvatarAccessibilityRole(AvatarComponentSelector.SecondaryComponent)).toEqual('ControlType.Image');
  });
});
