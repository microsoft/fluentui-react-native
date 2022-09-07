import NavigateAppPage from '../../common/NavigateAppPage';
import RadioGroupPageObject from '../pages/RadioGroupPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroup/RadioButton Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to RadioGroup test page', async () => {
    await RadioGroupPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToRadioGroupPage();
    await RadioGroupPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await RadioGroupPageObject.isPageLoaded()).toBeTruthy();
  });
});
