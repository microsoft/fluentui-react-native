import RadioGroupLegacyPageObject from '../pages/RadioGroupLegacyPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroup/RadioButton Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await RadioGroupLegacyPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to RadioGroup Legacy test page', async () => {
    expect(await RadioGroupLegacyPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
