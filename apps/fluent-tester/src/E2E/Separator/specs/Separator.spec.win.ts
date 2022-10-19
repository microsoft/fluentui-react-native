import NavigateAppPage from '../../common/NavigateAppPage';
import SeparatorPageObject from '../pages/SeparatorPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Separator Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Separator test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToSeparatorPage();
    await SeparatorPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await SeparatorPageObject.isPageLoaded()).toBeTruthy(SeparatorPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await SeparatorPageObject.didAssertPopup()).toBeFalsy(SeparatorPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
