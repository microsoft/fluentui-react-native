import RadioGroupLegacyPageObject from '../pages/RadioGroupLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroup Legacy Testing Initialization', function () {
  it('Wait for app load', async () => {
    await RadioGroupLegacyPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to RadioGroup Legacy test page', async () => {
    await RadioGroupLegacyPageObject.navigateToPageAndLoadTests();
  });
});
