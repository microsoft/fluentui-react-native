import NavigateAppPage from '../../common/NavigateAppPage';
import CheckboxLegacyPageObject from '../pages/CheckboxLegacyPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

describe('Checkbox Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Checkbox Legacy test page', async () => {
    await CheckboxLegacyPageObject.mobileScrollToComponentButton();
    await CheckboxLegacyPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToCheckboxLegacyPage();
    await CheckboxLegacyPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await CheckboxLegacyPageObject.isPageLoaded()).toBeTruthy();
  });
});
