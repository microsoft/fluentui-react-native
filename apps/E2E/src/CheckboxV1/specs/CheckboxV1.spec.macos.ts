import CheckboxV1PageObject from '../pages/CheckboxV1PageObject';

describe('CheckboxV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    await CheckboxV1PageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to CheckboxV1 test page', async () => {
    await CheckboxV1PageObject.navigateToPageAndLoadTests();

    await expect(await CheckboxV1PageObject.didAssertPopup()).toBeFalsy(CheckboxV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});
