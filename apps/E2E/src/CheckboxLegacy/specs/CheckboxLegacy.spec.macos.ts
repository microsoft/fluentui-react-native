import CheckboxLegacyPageObject from '../pages/CheckboxLegacyPageObject';

describe('Checkbox Legacy Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await CheckboxLegacyPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Checkbox Legacy test page', async () => {
    expect(await CheckboxLegacyPageObject.navigateToPageAndLoadTests()).toBeTrue();

    await expect(await CheckboxLegacyPageObject.isPageLoaded()).toBeTruthy();
  });
});
