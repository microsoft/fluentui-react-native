import SpinnerPageObject from '../pages/SpinnerPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Spinner Testing Initialization', () => {
  it('Wait for app load', async () => {
    await SpinnerPageObject.waitForInitialPageToDisplay();
    expect(await SpinnerPageObject.isInitialPageDisplayed()).toBeTruthy(SpinnerPageObject.ERRORMESSAGE_APPLOAD);
  });
});
