import RadioGroupLegacyPageObject from '../pages/RadioGroupLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroup/RadioButton Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    await RadioGroupLegacyPageObject.waitForInitialPageToDisplay();
    expect(await RadioGroupLegacyPageObject.isInitialPageDisplayed()).toBeTruthy(RadioGroupLegacyPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to RadioGroup Legacy test page', async () => {
    await RadioGroupLegacyPageObject.navigateToPageAndLoadTests();
    expect(await RadioGroupLegacyPageObject.isPageLoaded()).toBeTruthy(RadioGroupLegacyPageObject.ERRORMESSAGE_PAGELOAD);
  });
});
