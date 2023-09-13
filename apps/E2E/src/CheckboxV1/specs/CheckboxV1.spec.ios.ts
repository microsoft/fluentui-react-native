import CheckboxV1PageObject from '../pages/CheckboxV1PageObject';

describe('CheckboxV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await CheckboxV1PageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to CheckboxV1 test page', async () => {
    expect(await CheckboxV1PageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
