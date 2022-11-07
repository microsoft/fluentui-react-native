import NavigateAppPage from '../../common/NavigateAppPage';
import RadioGroupExperimentalPageObject, { RadioSelector } from '../pages/RadioGroupExperimentalPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, Keys } from '../../common/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroup/Radio Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy();
  });

  it('Click and navigate to RadioGroup test page', async () => {
    await RadioGroupExperimentalPageObject.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToRadioGroupExperimentalPage();
    await RadioGroupExperimentalPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await RadioGroupExperimentalPageObject.isPageLoaded()).toBeTruthy();
  });
});

describe('RadioGroup Functional Testing', async () => {
  /* This resets the RadioGroup state by clicking/selecting the 1st Radio in the RadioGroup */
  beforeEach(async () => {
    await RadioGroupExperimentalPageObject.scrollToTestElement();
    await RadioGroupExperimentalPageObject.waitForPrimaryElementDisplayed(PAGE_TIMEOUT);

    await RadioGroupExperimentalPageObject.resetRadioGroupSelection();
  });

  it('Click on a Radio and ensure it changes state from unselected -> selected', async () => {
    /* Validate the Radio is not initially selected */
    await expect(await RadioGroupExperimentalPageObject.isRadioSelected(RadioSelector.Second)).toBeFalsy();

    /* Click on the Radio to select it */
    await RadioGroupExperimentalPageObject.clickRadio(RadioSelector.Second);
    await RadioGroupExperimentalPageObject.waitForRadioSelected(RadioSelector.Second, PAGE_TIMEOUT);

    /* Validate the Radio is selected */
    await expect(await RadioGroupExperimentalPageObject.isRadioSelected(RadioSelector.Second)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Keyboard to Radio and check for Selection state', async () => {
    // Presses the ArrowDown key while the first (A) Radio is selected
    await RadioGroupExperimentalPageObject.sendKey(Keys.ARROW_DOWN, RadioSelector.First);
    await RadioGroupExperimentalPageObject.waitForRadioSelected(RadioSelector.Second, 5000);

    /* Validate the Radio is selected */
    await expect(await RadioGroupExperimentalPageObject.isRadioSelected(RadioSelector.Second)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it("Keyboard to DISABLED Radio and validate it doesn't get selected", async () => {
    // Presses the ArrowDown key while the second (B) Radio is selected
    await RadioGroupExperimentalPageObject.sendKey(Keys.ARROW_DOWN, RadioSelector.Second);
    await RadioGroupExperimentalPageObject.waitForRadioSelected(RadioSelector.Fourth, 5000); // It should skip RadioButton 3 since it is disabled

    /* Validate the Radio is selected */
    await expect(await RadioGroupExperimentalPageObject.isRadioSelected(RadioSelector.Fourth)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate tab out of RadioGroup', async () => {
    // Presses the Tab key while the second (B) Radio is selected in first RadioGroup
    await RadioGroupExperimentalPageObject.sendKey(Keys.TAB, RadioSelector.Second);
    await RadioGroupExperimentalPageObject.waitForRadioFocused(RadioSelector.Fifth, 5000);

    /* Validate the Radio is not focused */
    await expect(await RadioGroupExperimentalPageObject.isRadioFocused(RadioSelector.Fifth)).toBeTruthy();
    await expect(await RadioGroupExperimentalPageObject.didAssertPopup()).toBeFalsy(RadioGroupExperimentalPageObject.ERRORMESSAGE_ASSERT);
  });
});
