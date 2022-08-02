import NavigateAppPage from '../../common/NavigateAppPage.win';
import SwitchPageObject from '../pages/SwitchPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Switch Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Switch test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    SwitchPageObject.scrollToComponentButton();
    SwitchPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToSwitchPage();
    SwitchPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(SwitchPageObject.isPageLoaded()).toBeTruthy(SwitchPageObject.ERRORMESSAGE_PAGELOAD);
    expect(SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Switch Accessibility Testing', () => {
  /* Scrolls and waits for the Switch to be visible on the Test Page */
  beforeEach(() => {
    SwitchPageObject.scrollToTestElement();
    SwitchPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Switch - Validate accessibilityRole is correct', () => {
    expect(SwitchPageObject.getAccessibilityRole()).toEqual(BUTTON_A11Y_ROLE);
    expect(SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Switch Functional Testing', () => {
  /* Scrolls and waits for the Switch to be visible on the Test Page */
  beforeEach(() => {
    SwitchPageObject.scrollToTestElement();
    SwitchPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it("Click on a Switch -> Validate it toggles correctly AND calls the user's onChange", () => {
    /* Validate the Switch is initially toggled OFF */
    expect(SwitchPageObject.isSwitchChecked()).toBeFalsy();

    /* Click on the Switch to toggle on */
    SwitchPageObject.clickComponent();
    SwitchPageObject.waitForSwitchChecked(PAGE_TIMEOUT);

    expect(SwitchPageObject.didOnChangeCallbackFire()).toBeTruthy();

    /* Validate the Switch is toggled ON */
    expect(SwitchPageObject.isSwitchChecked()).toBeTruthy();

    SwitchPageObject.clickComponent();

    /* Validate the Switch is toggled OFF */
    expect(SwitchPageObject.isSwitchChecked()).toBeFalsy();
    expect(SwitchPageObject.didAssertPopup()).toBeFalsy(SwitchPageObject.ERRORMESSAGE_ASSERT);
  });
});
