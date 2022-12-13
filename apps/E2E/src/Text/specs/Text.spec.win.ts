import NavigateAppPage from '../../common/NavigateAppPage';
import TextPageObject, { TextComponentSelector } from '../pages/TextPageObject';
import { TEXT_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import {
  DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL,
  DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT,
  V1_TEXT_FIRST_ACCESSIBILITY_LABEL,
  V1_TEXT_SECOND_COMPONENT_CONTENT,
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

describe('V1 Text Accessibility Testing', () => {
  beforeEach(async () => {
    await TextPageObject.scrollToTestElement(await TextPageObject._v1FirstComponent);
  });

  it('V1 Text - Validate accessibilityRole is correct', async () => {
    await expect(await TextPageObject.getTextAccessibilityRole(TextComponentSelector.V1_First)).toEqual(TEXT_A11Y_ROLE);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });

  it('V1 Text - Set accessibilityLabel', async () => {
    await expect(await TextPageObject.getTextAccessibilityLabel(TextComponentSelector.V1_First)).toEqual(V1_TEXT_FIRST_ACCESSIBILITY_LABEL);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });

  it('V1 Text - Do not set accessibilityLabel -> Default to content', async () => {
    await expect(await TextPageObject.getTextAccessibilityLabel(TextComponentSelector.V1_Second)).toEqual(V1_TEXT_SECOND_COMPONENT_CONTENT);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Deprecated Text Accessibility Testing', () => {
  beforeEach(async () => {
    await TextPageObject.scrollToTestElement(await TextPageObject._deprecatedFirstComponent);
  });

  it('Deprecated Text - Validate accessibilityRole is correct', async () => {
    await expect(await TextPageObject.getTextAccessibilityRole(TextComponentSelector.Deprecated_First)).toEqual(TEXT_A11Y_ROLE);
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Deprecated Text - Set accessibilityLabel', async () => {
    await expect(await TextPageObject.getTextAccessibilityLabel(TextComponentSelector.Deprecated_First)).toEqual(
      DEPRECATED_TEXT_FIRST_ACCESSIBILITY_LABEL,
    );
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Deprecated Text - Do not set accessibilityLabel -> Default to content', async () => {
    await expect(await TextPageObject.getTextAccessibilityLabel(TextComponentSelector.Deprecated_Second)).toEqual(
      DEPRECATED_TEXT_SECOND_COMPONENT_CONTENT,
    );
    await expect(await TextPageObject.didAssertPopup()).toBeFalsy(TextPageObject.ERRORMESSAGE_ASSERT);
  });
});
