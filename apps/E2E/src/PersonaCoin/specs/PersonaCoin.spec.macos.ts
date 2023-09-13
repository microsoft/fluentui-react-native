import PersonaCoinPageObject from '../pages/PersonaCoinPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('PersonaCoin Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await PersonaCoinPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to PersonaCoin test page', async () => {
    expect(await PersonaCoinPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
