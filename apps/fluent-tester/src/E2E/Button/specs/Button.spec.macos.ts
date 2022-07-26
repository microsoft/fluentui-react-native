import NavigateAppPage from '../../common/NavigateAppPage.macos';
import ButtonPageObject from '../pages/ButtonPageObject.macos';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Maximize application', () => {
    let fluentTesterWindow = null;

    // Maximize app window
    browser.waitUntil(() => {
      fluentTesterWindow = $('//*[@title="Fluent Tester" and @elementType=4]');
      return fluentTesterWindow != null;
    })

    const maxButton = fluentTesterWindow.$('//*[@identifier="_XCUI:FullScreenWindow" and @elementType=9]');
    maxButton.click();
    console.log('\n\nLocation: ' + fluentTesterWindow.getLocation());
  })

  it('Click and navigate to Button test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ButtonPageObject.scrollToComponentButton();
    ButtonPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToButtonPage();
    ButtonPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ButtonPageObject.isPageLoaded()).toBeTruthy();
  });
});
