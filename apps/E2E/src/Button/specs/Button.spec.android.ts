import NavigateAppPage from '../../common/NavigateAppPage';
import ButtonPageObject from '../pages/ButtonPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

function imageDump(fileName: string) {
  // build file path
  const filePath = './errorShots/' + fileName + '.png';
  // save screenshot
  browser.saveScreenshot(filePath);
}

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    imageDump('1');

    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
    imageDump('2');
  });

  it('Click and navigate to Button test page', async () => {
    await ButtonPageObject.mobileScrollToComponentButton();
    await ButtonPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);
    imageDump('3');

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToButtonPage();
    await ButtonPageObject.waitForPageDisplayed(PAGE_TIMEOUT);
    imageDump('4');

    await expect(await ButtonPageObject.isPageLoaded()).toBeTruthy();
  });
});
