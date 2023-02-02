import { BOOT_APP_TIMEOUT, PAGE_TIMEOUT, TEXT_A11Y_ROLE } from '../../common/consts';
import NavigateAppPage from '../../common/NavigateAppPage';
import { DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL, DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT } from '../consts';
import TextLegacyPageObject from '../pages/TextLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Text Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Text Legacy test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTextLegacyPage();
    await TextLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(await TextLegacyPageObject.isPageLoaded()).toBeTruthy(TextLegacyPageObject.ERRORMESSAGE_PAGELOAD);
    expect(await TextLegacyPageObject.didAssertPopup()).toBeFalsy(TextLegacyPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Text Legacy Accessibility Testing', () => {
  beforeEach(async () => {
    await TextLegacyPageObject.scrollToTestElement(await TextLegacyPageObject._deprecatedFirstComponent);
  });

  it('Text Legacy - Validate accessibilityRole is correct', async () => {
    expect(await TextLegacyPageObject.getTextAccessibilityRole('Deprecated_First')).toEqual(TEXT_A11Y_ROLE);
    expect(await TextLegacyPageObject.didAssertPopup()).toBeFalsy(TextLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text Legacy - Set accessibilityLabel', async () => {
    expect(await TextLegacyPageObject.getTextAccessibilityLabel('Deprecated_First')).toEqual(DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL);
    expect(await TextLegacyPageObject.didAssertPopup()).toBeFalsy(TextLegacyPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text Legacy - Do not set accessibilityLabel -> Default to content', async () => {
    expect(await TextLegacyPageObject.getTextAccessibilityLabel('Deprecated_Second')).toEqual(DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT);
    expect(await TextLegacyPageObject.didAssertPopup()).toBeFalsy(TextLegacyPageObject.ERRORMESSAGE_ASSERT);
  });
});
