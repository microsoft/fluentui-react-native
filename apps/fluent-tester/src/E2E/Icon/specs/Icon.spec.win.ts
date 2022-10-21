import NavigateAppPage from '../../common/NavigateAppPage';
import IconPageObject from '../pages/IconPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

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
