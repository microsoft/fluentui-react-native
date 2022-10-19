import NavigateAppPage from '../../common/NavigateAppPage';
import PersonaCoinPageObject from '../pages/PersonaCoinPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('PersonaCoin Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to PersonaCoin test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToPersonaCoinPage();
    await PersonaCoinPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await PersonaCoinPageObject.isPageLoaded()).toBeTruthy(PersonaCoinPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await PersonaCoinPageObject.didAssertPopup()).toBeFalsy(PersonaCoinPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
