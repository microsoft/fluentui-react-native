import NavigateAppPage from '../../common/NavigateAppPage';
import PersonaPageObject from '../pages/PersonaPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Persona Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Persona test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToPersonaPage();
    await PersonaPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await PersonaPageObject.isPageLoaded()).toBeTruthy(PersonaPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await PersonaPageObject.didAssertPopup()).toBeFalsy(PersonaPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
