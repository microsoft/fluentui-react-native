import NavigateAppPage from '../../common/NavigateAppPage';
import TextPageObject from '../pages/TextPageObject';
import { ComponentSelector, Platform } from '../../common/BasePage';
import { TEXT_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import { TEXT_ACCESSIBILITY_LABEL, TEXT_COMPONENT_CONTENT } from '../../../TestComponents/Text/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Text Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Text test page', async () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    await TextPageObject.scrollToComponentButton(Platform.Win32);
    await TextPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTextPage();
    await TextPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TextPageObject.isPageLoaded()).toBeTruthy(TextPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Text Accessibility Testing', () => {
  beforeEach(async () => {
    await TextPageObject.scrollToTestElement();
    await TextPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Text - Validate accessibilityRole is correct', async () => {
    await expect(await TextPageObject.getAccessibilityRole()).toEqual(TEXT_A11Y_ROLE);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text - Set accessibilityLabel', async () => {
    await expect(await TextPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(TEXT_ACCESSIBILITY_LABEL);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text - Do not accessibilityLabel -> Default to content', async () => {
    await expect(await TextPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(TEXT_COMPONENT_CONTENT);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });
});
