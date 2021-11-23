import NavigateAppPage from '../../common/NavigateAppPage';
import RadioGroupPageObject from '../pages/RadioGroupPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroup/RadioButton Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to RadioGroup test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    RadioGroupPageObject.scrollToComponentButton();
    RadioGroupPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToRadioGroupPage();
    RadioGroupPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(RadioGroupPageObject.isPageLoaded()).toBeTruthy();
  });
});