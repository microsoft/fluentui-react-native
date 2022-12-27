import NavigateAppPage from '../../common/NavigateAppPage';
import ContextualMenuPageObjectObject from '../pages/ContextualMenuPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('ContextualMenu Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to ContextualMenu test page', async () => {
    await ContextualMenuPageObjectObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToContextualMenuPage();
    await ContextualMenuPageObjectObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ContextualMenuPageObjectObject.isPageLoaded()).toBeTruthy(ContextualMenuPageObjectObject.ERRORMESSAGE_PAGELOAD);
  });
});
