import NavigateAppPage from '../../common/NavigateAppPage';
import CheckboxPageObject from '../pages/CheckboxPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

describe('Checkbox Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Checkbox test page', async () => {
    await CheckboxPageObject.mobileScrollToComponentButton();
    await CheckboxPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToCheckboxPage();
    await CheckboxPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await CheckboxPageObject.isPageLoaded()).toBeTruthy();
  });
});
