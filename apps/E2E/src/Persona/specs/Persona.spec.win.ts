import PersonaPageObject from '../pages/PersonaPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Persona Testing Initialization', function () {
  it('Wait for app load', async () => {
    await PersonaPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Persona test page', async () => {
    await PersonaPageObject.navigateToPageAndLoadTests();

    await expect(await PersonaPageObject.didAssertPopup()).toBeFalsy(PersonaPageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
