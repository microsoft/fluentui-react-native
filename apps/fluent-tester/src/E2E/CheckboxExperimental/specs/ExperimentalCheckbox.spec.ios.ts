import NavigateAppPage from '../../common/NavigateAppPage';
import ExperimentalCheckboxPageObject from '../pages/ExperimentalCheckboxPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

describe('Experimental Checkbox Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Experimental Checkbox test page', async () => {
    await ExperimentalCheckboxPageObject.mobileScrollToComponentButton();
    await ExperimentalCheckboxPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToCheckboxExperimentalPage();
    await ExperimentalCheckboxPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalCheckboxPageObject.isPageLoaded()).toBeTruthy(ExperimentalCheckboxPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
