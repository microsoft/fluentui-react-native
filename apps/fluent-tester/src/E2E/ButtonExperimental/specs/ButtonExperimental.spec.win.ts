import NavigateAppPage from '../../common/NavigateAppPage.win';
import ButtonExperimentalPageObject, { ButtonSelector } from '../pages/ButtonExperimentalPageObject';
import { ComponentSelector } from '../../common/BasePage.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE, Keys } from '../../common/consts';
import { BUTTON_ACCESSIBILITY_LABEL, BUTTON_TEST_COMPONENT_LABEL } from '../../../TestComponents/Button/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Experimental Button Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Button test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ButtonExperimentalPageObject.scrollToComponentButton();
    ButtonExperimentalPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToButtonPage();
    ButtonExperimentalPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ButtonExperimentalPageObject.isPageLoaded()).toBeTruthy(ButtonExperimentalPageObject.ERRORMESSAGE_PAGELOAD);
    expect(ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Experimental Button Accessibility Testing', () => {
  it('Experimental Button - Validate accessibilityRole is correct', () => {
    ButtonExperimentalPageObject.scrollToTestElement();
    ButtonExperimentalPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    expect(ButtonExperimentalPageObject.getAccessibilityRole()).toEqual(BUTTON_A11Y_ROLE);
    expect(ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Experimental Button - Set accessibilityLabel', () => {
    ButtonExperimentalPageObject.scrollToTestElement();
    ButtonExperimentalPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    expect(ButtonExperimentalPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(BUTTON_ACCESSIBILITY_LABEL);
    expect(ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Experimental Button - Do not set accessibilityLabel -> Default to Button label', () => {
    ButtonExperimentalPageObject.scrollToTestElement();
    ButtonExperimentalPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    expect(ButtonExperimentalPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(BUTTON_TEST_COMPONENT_LABEL);
    expect(ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Experimental Button Functional Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(() => {
    ButtonExperimentalPageObject.scrollToTestElement();
    ButtonExperimentalPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Validate OnClick() callback was fired -> Click', () => {
    ButtonExperimentalPageObject.clickComponent();
    expect(ButtonExperimentalPageObject.didOnClickCallbackFire()).toBeTruthy();
    expect(ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);

    ButtonExperimentalPageObject.clickComponent(); // Reset Button State
  });

  it('Validate OnClick() callback was fired -> Type "Enter"', () => {
    ButtonExperimentalPageObject.sendKey(ButtonSelector.PrimaryButton, Keys.Enter);
    expect(ButtonExperimentalPageObject.didOnClickCallbackFire()).toBeTruthy();
    expect(ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);

    ButtonExperimentalPageObject.clickComponent(); // Reset Button State
  });

  it('Validate OnClick() callback was fired -> Type "Spacebar"', () => {
    ButtonExperimentalPageObject.sendKey(ButtonSelector.PrimaryButton, Keys.Spacebar);
    expect(ButtonExperimentalPageObject.didOnClickCallbackFire()).toBeTruthy();
    expect(ButtonExperimentalPageObject.didAssertPopup()).toBeFalsy(ButtonExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });
});
