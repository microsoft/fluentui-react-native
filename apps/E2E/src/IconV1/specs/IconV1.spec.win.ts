import NavigateAppPage from '../../common/NavigateAppPage';
import IconV1PageObject from '../pages/IconV1PageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import { ComponentSelector } from '../../common/BasePage';
import { ICON_ACCESSIBILITY_LABEL } from '../../IconLegacy/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('IconV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to IconV1 test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToIconPage();
    await IconV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await IconV1PageObject.isPageLoaded()).toBeTruthy(IconV1PageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await IconV1PageObject.didAssertPopup()).toBeFalsy(IconV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('IconV1 Accessibility Testing', () => {
  beforeEach(async () => {
    await IconV1PageObject.scrollToTestElement();
  });

  it('Validate accessibilityLabel for SVG Icon', async () => {
    await expect(await IconV1PageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(ICON_ACCESSIBILITY_LABEL);
    await expect(await IconV1PageObject.didAssertPopup()).toBeFalsy(IconV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate accessibilityLabel for Font Icon', async () => {
    await expect(await IconV1PageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(ICON_ACCESSIBILITY_LABEL);
    await expect(await IconV1PageObject.didAssertPopup()).toBeFalsy(IconV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate accessibilityRole for SVG Icon', async () => {
    await expect(await IconV1PageObject.getAccessibilityRole()).toEqual('ControlType.Image');
    await expect(await IconV1PageObject.didAssertPopup()).toBeFalsy(IconV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
