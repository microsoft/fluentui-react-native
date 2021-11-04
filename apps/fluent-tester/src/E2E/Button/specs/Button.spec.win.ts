import NavigateAppPage from '../../common/NavigateAppPage';
import ButtonPageObject from '../pages/ButtonTestPage.win';
import { ComponentSelector } from '../../common/BasePage';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE } from '../../common/consts';
import { BUTTON_ACCESSIBILITY_LABEL, BUTTON_TEST_COMPONENT_LABEL } from '../../../FluentTester/TestComponents/Button/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    //browser.saveScreenshot('./errorShots/onBoot.png'); // Take a screenshot of the app on load. Helpful to have a screenshot
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
  it('Validate accessibilityRole is correct', () => {
    ButtonPageObject.scrollToTestElement();
    ButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ButtonPageObject.getAccessibilityRole()).toEqual(BUTTON_A11Y_ROLE);
  });

  it('Set accessibilityLabel', () => {
    ButtonPageObject.scrollToTestElement();
    ButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ButtonPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(BUTTON_ACCESSIBILITY_LABEL);
  });

  it('Do not set accessibilityLabel -> Default to Button label', () => {
    ButtonPageObject.scrollToTestElement();
    ButtonPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
    expect(ButtonPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(BUTTON_TEST_COMPONENT_LABEL);
  });
});
