import { AndroidAttribute } from '../../common/consts';
import { CHIP_END_TEXT, CHIP_START_TEXT } from '../consts';
import ChipPageObject from '../pages/ChipPageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('Chip Testing Initialization', () => {
  it('Wait for app load', async () => {
    await ChipPageObject.waitForInitialPageToDisplay();
    expect(await ChipPageObject.isInitialPageDisplayed()).toBeTruthy(ChipPageObject.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Chip test page', async () => {
    await ChipPageObject.navigateToPageAndLoadTests(true);
    expect(await ChipPageObject.isPageLoaded()).toBeTruthy(ChipPageObject.ERRORMESSAGE_PAGELOAD);

    await expect(await ChipPageObject.didAssertPopup()).toBeFalsy(ChipPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Chip Functional Testing', () => {
  /* Scrolls and waits for the Input to be visible on the Test Page */
  beforeEach(async () => {
    await ChipPageObject.mobileScrollToTestElement();
  });

  it('Validate OnPress() callback was fired -> Click', async () => {
    /* Verify that the callback text is in start state */
    await expect(await ChipPageObject.compareAttribute(ChipPageObject._callbackText, AndroidAttribute.Text, CHIP_START_TEXT)).toBeTruthy();

    /* Click the Chip and verify callback text gets updated */
    await ChipPageObject.click(ChipPageObject._primaryComponent);
    await expect(await ChipPageObject.compareAttribute(ChipPageObject._callbackText, AndroidAttribute.Text, CHIP_END_TEXT)).toBeTruthy();
    await expect(await ChipPageObject.didAssertPopup()).toBeFalsy(ChipPageObject.ERRORMESSAGE_ASSERT);
  });
});
