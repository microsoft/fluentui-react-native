import NavigateAppPage from '../../common/NavigateAppPage.win';
import TextPageObject from '../pages/TextPageObject.win';
import { ComponentSelector } from '../../common/BasePage.win';
import { TEXT_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import { TEXT_ACCESSIBILITY_LABEL, TEXT_COMPONENT_CONTENT } from '../../../FluentTester/TestComponents/Text/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Text Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Text test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    TextPageObject.scrollToComponentButton();
    TextPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToTextPage();
    TextPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(TextPageObject.isPageLoaded()).toBeTruthy(TextPageObject.ERRORMESSAGE_PAGELOAD);
    expect(TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Text Accessibility Testing', () => {
  beforeEach(() => {
    TextPageObject.scrollToTestElement();
    TextPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Text - Validate accessibilityRole is correct', () => {
    expect(TextPageObject.getAccessibilityRole()).toEqual(TEXT_A11Y_ROLE);
    expect(TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text - Set accessibilityLabel', () => {
    expect(TextPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(TEXT_ACCESSIBILITY_LABEL);
    expect(TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text - Do not accessibilityLabel -> Default to content', () => {
    expect(TextPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(TEXT_COMPONENT_CONTENT);
    expect(TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });
});
