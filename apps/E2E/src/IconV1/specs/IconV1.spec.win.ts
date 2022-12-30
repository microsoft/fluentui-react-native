import NavigateAppPage from '../../common/NavigateAppPage';
import IconPageObject from '../pages/IconV1PageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';
import { ComponentSelector } from '../../common/BasePage';
import { ICON_ACCESSIBILITY_LABEL } from '../../IconLegacy/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Icon Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Icon test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToIconPage();
    await IconPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await IconPageObject.isPageLoaded()).toBeTruthy(IconPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await IconPageObject.didAssertPopup()).toBeFalsy(IconPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Icon Accessibility Testing', () => {
  beforeEach(async () => {
    await IconPageObject.scrollToTestElement();
  });

  it('Validate accessibilityLabel for SVG Icon', async () => {
    await expect(await IconPageObject.getAccessibilityLabel(ComponentSelector.Primary)).toEqual(ICON_ACCESSIBILITY_LABEL);
    await expect(await IconPageObject.didAssertPopup()).toBeFalsy(IconPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate accessibilityLabel for Font Icon', async () => {
    await expect(await IconPageObject.getAccessibilityLabel(ComponentSelector.Secondary)).toEqual(ICON_ACCESSIBILITY_LABEL);
    await expect(await IconPageObject.didAssertPopup()).toBeFalsy(IconPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate accessibilityRole for SVG Icon', async () => {
    await expect(await IconPageObject.getAccessibilityRole()).toEqual('ControlType.Image');
    await expect(await IconPageObject.didAssertPopup()).toBeFalsy(IconPageObject.ERRORMESSAGE_ASSERT);
  });
});
