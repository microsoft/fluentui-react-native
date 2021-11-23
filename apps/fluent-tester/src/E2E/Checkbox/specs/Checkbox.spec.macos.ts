import NavigateAppPage from '../../common/NavigateAppPage';
import CheckboxPageObject from '../pages/CheckboxPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

describe('Checkbox Testing Initialization', () => {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Checkbox test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    CheckboxPageObject.scrollToComponentButton();
    CheckboxPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToCheckboxPage();
    CheckboxPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(CheckboxPageObject.isPageLoaded()).toBeTruthy();
  });
});