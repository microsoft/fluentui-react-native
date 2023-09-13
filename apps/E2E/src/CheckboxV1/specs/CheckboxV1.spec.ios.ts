import CheckboxV1PageObject from '../pages/CheckboxV1PageObject';

describe('CheckboxV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await CheckboxV1PageObject.waitForInitialPageToDisplay()).toBeTruthy(CheckboxV1PageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to CheckboxV1 test page', async () => {
    await CheckboxV1PageObject.navigateToPageAndLoadTests();
    expect(await CheckboxV1PageObject.isPageLoaded()).toBeTruthy(CheckboxV1PageObject.ERRORMESSAGE_PAGELOAD);
  });
});
