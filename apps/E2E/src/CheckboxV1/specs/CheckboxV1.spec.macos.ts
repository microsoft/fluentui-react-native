import NavigateAppPage from '../../common/NavigateAppPage';
import CheckboxV1PageObject from '../pages/CheckboxV1PageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

describe('CheckboxV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to CheckboxV1 test page', async () => {
    await CheckboxV1PageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToCheckboxV1Page();
    await CheckboxV1PageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await CheckboxV1PageObject.isPageLoaded()).toBeTruthy(CheckboxV1PageObject.ERRORMESSAGE_PAGELOAD);
  });
});
