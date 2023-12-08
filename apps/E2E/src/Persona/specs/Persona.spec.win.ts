import PersonaPageObject from '../pages/PersonaPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Persona Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await PersonaPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Persona test page', async () => {
    expect(await PersonaPageObject.navigateToPageAndLoadTests()).toBeTrue();

    await expect(await PersonaPageObject.didAssertPopup())
      .withContext(PersonaPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy(); // Ensure no asserts popped up
  });
});
