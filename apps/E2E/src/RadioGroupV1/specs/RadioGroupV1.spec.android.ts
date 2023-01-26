import RadioGroupV1PageObject, { Radio } from '../pages/RadioGroupV1PageObject';
import { AndroidAttribute, ANDROID_RADIOBUTTON } from '../../common/consts';
import { RADIOGROUPV1_TEST_COMPONENT } from '../consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('RadioGroupV1/RadioV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await RadioGroupV1PageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to RadioGroupV1 test page', async () => {
    await RadioGroupV1PageObject.navigateToPageAndLoadTests(true);

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT); // Ensure no asserts popped up
  });
});

describe('RadioGroupV1/RadioV1 Accessibility Testing', () => {
  /* Scrolls and waits for the RadioGroup to be visible on the Test Page */
  beforeEach(async () => {
    await RadioGroupV1PageObject.mobileScrollToTestElement();
  });

  it('RadioGroup - Verify accessibilityLabel', async () => {
    await expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject._primaryComponent,
        AndroidAttribute.AccessibilityLabel,
        RADIOGROUPV1_TEST_COMPONENT,
      ),
    ).toBeTruthy();
    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate Radio Group Class on Android', async () => {
    await expect(
      await RadioGroupV1PageObject.compareAttribute(
        RadioGroupV1PageObject.getRadio(Radio.First),
        AndroidAttribute.Class,
        ANDROID_RADIOBUTTON,
      ),
    ).toBeTruthy();

    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
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
    await expect(await RadioGroupV1PageObject.isRadioSelected(Radio.Second)).toBeFalsy();

    /* Click on the Radio to select it */
    await RadioGroupV1PageObject.click(RadioGroupV1PageObject.getRadio(Radio.Second));

    /* Validate the Radio is selected */
    await expect(
      await RadioGroupV1PageObject.waitForRadioSelected(Radio.Second, 'Expected radio #2 to be selected by click.'),
    ).toBeTruthy();
    await expect(await RadioGroupV1PageObject.didAssertPopup()).toBeFalsy(RadioGroupV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
