import NavigateAppPage from '../../common/NavigateAppPage';
import ThemePageObject from '../pages/ThemePageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Theme Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Theme test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToThemePage();
    await ThemePageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ThemePageObject.isPageLoaded()).toBeTruthy(ThemePageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ThemePageObject.didAssertPopup()).toBeFalsy(ThemePageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
