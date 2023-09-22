import SvgPageObject from '../pages/SvgPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Svg Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await SvgPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Svg test page', async () => {
    expect(await SvgPageObject.navigateToPageAndLoadTests()).toBeTrue();
  });
});
