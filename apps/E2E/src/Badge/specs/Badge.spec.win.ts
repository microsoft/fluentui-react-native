import NavigateAppPage from '../../common/NavigateAppPage';
import BasicBadgePageObject from '../pages/BasicBadgePageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Badge Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Badge test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToBadgePage();
    await BasicBadgePageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await BasicBadgePageObject.isPageLoaded()).toBeTruthy(BasicBadgePageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await BasicBadgePageObject.didAssertPopup()).toBeFalsy(BasicBadgePageObject.ERRORMESSAGE_ASSERT);
  });
});
