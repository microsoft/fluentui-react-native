import NavigateAppPage from '../../common/NavigateAppPage';
import TabsV1PageObject from '../pages/TabsV1PageObject';
import { TAB_A11Y_ROLE, TABITEM_A11Y_ROLE, BOOT_APP_TIMEOUT, PAGE_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('TabsV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to TabsV1 test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToTabsV1Page();
    await TabsV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await TabsV1PageObject.isPageLoaded()).toBeTruthy(TabsV1PageObject.ERRORMESSAGE_PAGELOAD);

    await TabsV1PageObject.enableE2ETesterMode();

    await expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('TabsV1 Accessibility Testing', () => {
  it("Validate TabsItem's accessibilityRole is correct", async () => {
    await TabsV1PageObject.scrollToTestElement();

    await expect(await TabsV1PageObject.getAccessibilityRole()).toEqual(TAB_A11Y_ROLE);
    await expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it("Validate TabsItem's accessibilityRole is correct", async () => {
    await TabsV1PageObject.scrollToTestElement();

    await expect(await TabsV1PageObject.getTabItemAccesibilityRole()).toEqual(TABITEM_A11Y_ROLE);
    await expect(await TabsV1PageObject.didAssertPopup()).toBeFalsy(TabsV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
