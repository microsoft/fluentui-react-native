import { LINK_A11Y_ROLE, Attribute, Keys } from '../../common/consts';
import { LINKV1_ACCESSIBILITY_LABEL } from '../consts';
import LinkV1PageObject from '../pages/LinkV1PageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('LinkV1 Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await LinkV1PageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to LinkV1 test page', async () => {
    expect(await LinkV1PageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await LinkV1PageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await LinkV1PageObject.didAssertPopup())
      .withContext(LinkV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy(); // Ensure no asserts popped up
  });
});

describe('LinkV1 Accessibility Testing', () => {
  beforeAll(async () => {
    await LinkV1PageObject.scrollToTestElement();
  });

  it('Validate "accessibilityRole" defaults to "ControlType.HyperLink".', async () => {
    await expect(
      await LinkV1PageObject.compareAttribute(LinkV1PageObject._primaryComponent, Attribute.AccessibilityRole, LINK_A11Y_ROLE),
    ).toBeTruthy();
  });

  it('Set "accessibilityLabel" prop. Validate "accessibilityLabel" propagates to "Name" element attribute.', async () => {
    await expect(
      await LinkV1PageObject.compareAttribute(LinkV1PageObject._primaryComponent, Attribute.AccessibilityLabel, LINKV1_ACCESSIBILITY_LABEL),
    ).toBeTruthy();
  });

  // No need to test not setting a11y label. The content prop gets passed down to the child Text component. This equates to not setting the a11y label
  // on a Text component which we have testing for in our Text component spec
});

describe('Link Testing Functionality', () => {
  /* Scrolls and waits for the Link to be visible on the Test Page */
  beforeEach(async () => {
    await LinkV1PageObject.scrollToTestElement();
  });

  it('Validate OnPress() callback was fired on a click', async () => {
    await LinkV1PageObject.click(LinkV1PageObject._secondaryComponent);
    await expect(
      await LinkV1PageObject.didOnPressCallbackFire(`The link failed to fire an onPress callback with a mouse click.`),
    ).toBeTruthy();
    await expect(await LinkV1PageObject.didAssertPopup())
      .withContext(LinkV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Validate OnPress() callback was fired after hitting "Enter"', async () => {
    await LinkV1PageObject.sendKeys(LinkV1PageObject._secondaryComponent, [Keys.ENTER]);
    await expect(
      await LinkV1PageObject.didOnPressCallbackFire(`The link failed to fire an OnPress callback with an enter keypress.`),
    ).toBeTruthy();
    await expect(await LinkV1PageObject.didAssertPopup())
      .withContext(LinkV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Validate OnPress() callback was fired after hitting "SPACE"', async () => {
    await LinkV1PageObject.sendKeys(LinkV1PageObject._secondaryComponent, [Keys.SPACE]);
    await expect(
      await LinkV1PageObject.didOnPressCallbackFire(`The link failed to fire an OnPress callback with a space keypress.`),
    ).toBeTruthy();
    await expect(await LinkV1PageObject.didAssertPopup())
      .withContext(LinkV1PageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});
