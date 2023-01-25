import CheckboxLegacyPageObject from '../pages/CheckboxLegacyPageObject';

describe('Checkbox Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    await CheckboxLegacyPageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to Checkbox Legacy test page', async () => {
    await CheckboxLegacyPageObject.navigateToPageAndLoadTests();

    await expect(await CheckboxLegacyPageObject.isPageLoaded()).toBeTruthy();
  });
});
