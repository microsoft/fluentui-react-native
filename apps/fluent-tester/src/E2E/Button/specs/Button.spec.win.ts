import NavigateAppPage from '../../common/NavigateAppPage.win';
import ButtonPageObject from '../pages/ButtonPageObject';
import { ComponentSelector } from '../../common/BasePage.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE, Keys } from '../../common/consts';
import {
  BUTTON_TEST_COMPONENT,
  BUTTON_ACCESSIBILITY_LABEL,
  BUTTON_TEST_COMPONENT_LABEL,
} from '../../../FluentTester/TestComponents/Button/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Button test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ButtonPageObject.scrollToComponentButton();
    ButtonPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToButtonPage();
    ButtonPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ButtonPageObject.isPageLoaded()).toBeTruthy();
  });
});

describe('Button Accessibility Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(() => {
    ButtonPageObject.scrollToTestElement();
    ButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Button - Validate accessibilityRole is correct', () => {
    expect(ButtonPageObject.getAccessibilityRole()).toEqual(BUTTON_A11Y_ROLE);
  });

  it('Button - Set accessibilityLabel', () => {
    expect(ButtonPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(BUTTON_ACCESSIBILITY_LABEL);
  });

  it('Button - Do not set accessibilityLabel -> Default to Button label', () => {
    expect(ButtonPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(BUTTON_TEST_COMPONENT_LABEL);
  });
});

describe('Button Functional Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(() => {
    ButtonPageObject.scrollToTestElement();
    ButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Validate OnClick() callback was fired -> Click', () => {
    ButtonPageObject.clickComponent();
    expect(ButtonPageObject.didOnClickCallbackFire()).toBeTruthy();

    ButtonPageObject.clickComponent(); // Reset Button State
  });

  it('Validate OnClick() callback was fired -> Type "Enter"', () => {
    ButtonPageObject.sendKey(BUTTON_TEST_COMPONENT, Keys.Enter);
    expect(ButtonPageObject.didOnClickCallbackFire()).toBeTruthy();

    ButtonPageObject.clickComponent(); // Reset Button State
  });

  it('Validate OnClick() callback was fired -> Type "Spacebar"', () => {
    ButtonPageObject.sendKey(BUTTON_TEST_COMPONENT, Keys.Spacebar);
    expect(ButtonPageObject.didOnClickCallbackFire()).toBeTruthy();
  });
});
