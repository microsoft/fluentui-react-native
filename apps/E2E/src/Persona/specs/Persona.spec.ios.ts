import PersonaPageObject from '../pages/PersonaPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Persona Testing Initialization', () => {
  it('Wait for app load', async () => {
    await PersonaPageObject.waitForInitialPageToDisplay();
    expect(await PersonaPageObject.isInitialPageDisplayed()).toBeTruthy(PersonaPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Persona test page', async () => {
    await PersonaPageObject.navigateToPageAndLoadTests();
    expect(await PersonaPageObject.isPageLoaded()).toBeTruthy(PersonaPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
