import { AndroidAttribute, ANDROID_RADIOBUTTON } from '../../common/consts';
import { RADIOGROUPV1_TEST_COMPONENT } from '../consts';
import RadioGroupV1PageObject from '../pages/RadioGroupV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroupV1/RadioV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await RadioGroupV1PageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to RadioGroupV1 test page', async () => {
    expect(await RadioGroupV1PageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await RadioGroupV1PageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('RadioGroupV1/RadioV1 Accessibility Testing', () => {
  /* Scrolls and waits for the RadioGroup to be visible on the Test Page */
  beforeEach(async () => {
    await RadioGroupV1PageObject.mobileScrollToTestElement();
  });

  it('RadioGroup - Verify accessibilityLabel', async () => {
    expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject._primaryComponent,
        AndroidAttribute.AccessibilityLabel,
        RADIOGROUPV1_TEST_COMPONENT,
      ),
    ).toBeTruthy();
    expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate Radio Group Class on Android', async () => {
    expect(
      await RadioGroupV1PageObject.compareAttribute(RadioGroupV1PageObject.getRadio('First'), AndroidAttribute.Class, ANDROID_RADIOBUTTON),
    ).toBeTruthy();

    expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('RadioGroupV1 Functional Testing', async () => {
  /* This resets the RadioGroup state by clicking/selecting the 1st Radio in the RadioGroup */
  beforeEach(async () => {
    await RadioGroupV1PageObject.mobileScrollToTestElement();

    await RadioGroupV1PageObject.resetRadioGroupSelection();
  });

  it('Click on a Radio and ensure it changes state from unselected -> selected', async () => {
    /* Validate the Radio is not initially selected */
    expect(await RadioGroupV1PageObject.isRadioSelected('Second')).toBeFalsy();

    /* Click on the Radio to select it */
    await RadioGroupV1PageObject.click(RadioGroupV1PageObject.getRadio('Second'));

    /* Validate the Radio is selected */
    expect(await RadioGroupV1PageObject.waitForRadioSelected('Second', 'Expected radio #2 to be selected by click.')).toBeTruthy();
    expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
