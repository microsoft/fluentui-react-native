import NavigateAppPage from '../../common/NavigateAppPage';
import PersonaPageObject from '../pages/PersonaPageObject.win';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Persona Testing Initialization', function () {
  it('Wait for app load', () => {
    NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to Persona test page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    PersonaPageObject.scrollToComponentButton();
    PersonaPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    NavigateAppPage.clickAndGoToPersonaPage();
    PersonaPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(PersonaPageObject.isPageLoaded()).toBeTruthy();
  });
});
