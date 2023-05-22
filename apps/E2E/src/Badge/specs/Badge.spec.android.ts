import { BADGE_END_TEXT } from '../consts';
import BasicBadgePageObject from '../pages/BasicBadgePageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Badge Testing Initialization', () => {
  it('Wait for app load', async () => {
    await BasicBadgePageObject.waitForInitialPageToDisplay();
    expect(await BasicBadgePageObject.isInitialPageDisplayed()).toBeTruthy(BasicBadgePageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Badge test page', async () => {
    await BasicBadgePageObject.navigateToPageAndLoadTests(true);
    expect(await BasicBadgePageObject.isPageLoaded()).toBeTruthy(BasicBadgePageObject.ERRORMESSAGE_PAGELOAD);

    await expect(await BasicBadgePageObject.didAssertPopup()).toBeFalsy(BasicBadgePageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Badge Functional Testing', () => {
  /* Scrolls and waits for the Input to be visible on the Test Page */
  beforeEach(async () => {
    await BasicBadgePageObject.mobileScrollToTestElement();
  });

  it('Validate OnPress() callback was fired -> Click', async () => {
    await BasicBadgePageObject.click(BasicBadgePageObject._primaryComponent);
    await expect(await BasicBadgePageObject.verifyTextContent(BADGE_END_TEXT)).toBeTruthy();
    await expect(await BasicBadgePageObject.didAssertPopup()).toBeFalsy(BasicBadgePageObject.ERRORMESSAGE_ASSERT);
  });
});
