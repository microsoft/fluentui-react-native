import NavigateAppPage from '../../common/NavigateAppPage';
import TextPageObject, { TextComponentSelector } from '../pages/TextPageObject';
import { TEXT_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import {
  DEPRECATED_TEXT_ACCESSIBILITY_LABEL,
  DEPRECATED_TEXT_COMPONENT_CONTENT,
  TEXT_ACCESSIBILITY_LABEL,
  TEXT_COMPONENT_CONTENT,
} from '../../../../fluent-tester/src/TestComponents/Text/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Text Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Text test page', async () => {
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
    await expect(await TextPageObject.getTextAccessibilityRole(TextComponentSelector.First)).toEqual(TEXT_A11Y_ROLE);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text - Set accessibilityLabel', async () => {
    await expect(await TextPageObject.getTextAccessibilityLabel(TextComponentSelector.First)).toEqual(TEXT_ACCESSIBILITY_LABEL);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text - Do not set accessibilityLabel -> Default to content', async () => {
    await expect(await TextPageObject.getTextAccessibilityLabel(TextComponentSelector.Second)).toEqual(TEXT_COMPONENT_CONTENT);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Deprecated Text Accessibility Testing', () => {
  beforeEach(async () => {
    await TextPageObject.scrollToTestElement();
    await TextPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);
  });

  it('Deprecated Text - Validate accessibilityRole is correct', async () => {
    await expect(await TextPageObject.getTextAccessibilityRole(TextComponentSelector.Third)).toEqual(TEXT_A11Y_ROLE);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Deprecated Text - Set accessibilityLabel', async () => {
    await expect(await TextPageObject.getTextAccessibilityLabel(TextComponentSelector.Third)).toEqual(DEPRECATED_TEXT_ACCESSIBILITY_LABEL);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Deprecated Text - Do not set accessibilityLabel -> Default to content', async () => {
    await expect(await TextPageObject.getTextAccessibilityLabel(TextComponentSelector.Fourth)).toEqual(DEPRECATED_TEXT_COMPONENT_CONTENT);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });
});
