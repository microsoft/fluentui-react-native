import BasicBadgePageObject from '../pages/BasicBadgePageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Badge Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await BasicBadgePageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Badge test page', async () => {
    expect(await BasicBadgePageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
