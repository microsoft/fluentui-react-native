import { TEXT_A11Y_ROLE } from '../../common/consts';
import { TEXTV1_ACCESSIBILITY_LABEL, TEXTV1_CONTENT } from '../consts';
import TextV1PageObject from '../pages/TextV1PageObject.win';

// Before testing begins, allow up to 60 seconds for app to open
describe('TextV1 Testing Initialization', function () {
  it('Wait for app load', async () => {
    await TextV1PageObject.waitForInitialPageToDisplay();
  });

  it('Click and navigate to TextV1 test page', async () => {
    await TextV1PageObject.navigateToPageAndLoadTests(true);

    expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('TextV1 Accessibility Testing', () => {
  beforeEach(async () => {
    await TextV1PageObject.scrollToTestElement();
  });

  it('Text - Validate accessibilityRole is correct', async () => {
    expect(await TextV1PageObject.getAccessibilityRole()).toEqual(TEXT_A11Y_ROLE);
    expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text - Set accessibilityLabel', async () => {
    expect(await TextV1PageObject.getAccessibilityLabel('Primary')).toEqual(TEXTV1_ACCESSIBILITY_LABEL);
    expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });

  it('Text - Do not set accessibilityLabel -> Default to content', async () => {
    expect(await TextV1PageObject.getAccessibilityLabel('Secondary')).toEqual(TEXTV1_CONTENT);
    expect(await TextV1PageObject.didAssertPopup()).toBeFalsy(TextV1PageObject.ERRORMESSAGE_ASSERT);
  });
});
