import NavigateAppPage from '../../common/NavigateAppPage';
import ExperimentalTextPageObject from '../pages/ExperimentalTextPageObject.win';
import { TEXT_A11Y_ROLE, PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Experimental Text Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Experimental Text test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToExperimentalTextPage();
    await ExperimentalTextPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalTextPageObject.isPageLoaded()).toBeTruthy(ExperimentalTextPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ExperimentalTextPageObject.didAssertPopup()).toBeFalsy(ExperimentalTextPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('Experimental Text Accessibility Testing', () => {
  it('Text - Validate accessibilityRole is correct', async () => {
    await ExperimentalTextPageObject.scrollToTestElement();
    await ExperimentalTextPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await expect(await ExperimentalTextPageObject.getAccessibilityRole()).toEqual(TEXT_A11Y_ROLE);
    await expect(await ExperimentalTextPageObject.didAssertPopup()).toBeFalsy(ExperimentalTextPageObject.ERRORMESSAGE_ASSERT);
  });
});
