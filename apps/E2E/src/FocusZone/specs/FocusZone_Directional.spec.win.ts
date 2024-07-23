import { Attribute, AttributeValue, Keys } from '../../common/consts';
import FocusZonePageObject from '../pages/FocusZonePageObject';

// Before testing begins, allow up to 60 seconds for app to open
describe('FocusZone Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await FocusZonePageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to FocusZone test page', async () => {
    /* Click on component button to navigate to test page */
    expect(await FocusZonePageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await FocusZonePageObject.enableE2ETesterMode()).toBeTrue();

    await expect(await FocusZonePageObject.didAssertPopup())
      .withContext(FocusZonePageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy(); // Ensure no asserts popped up
  });
});

/* FocusZone Functional Testing
 *
 * Focuses on the directional aspect of FocusZone with arrow keys.
 *
 * */
describe('FocusZone Functional Testing', () => {
  beforeEach(async () => {
    await FocusZonePageObject.scrollToTestElement();

    await FocusZonePageObject.resetTest();
  });

  it('Navigate bidirectional focuszone using arrow keys. Validate focus switches correctly.', async () => {
    // move to 2 with right arrow
    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(1), [Keys.ARROW_RIGHT]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(2), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    // move to 3 with down arrow
    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(2), [Keys.ARROW_DOWN]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(3), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    expect(await FocusZonePageObject.didAssertPopup())
      .withContext(FocusZonePageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Navigate horizontal focuszone using arrow keys. Validate focus switches correctly.', async () => {
    await FocusZonePageObject.configureGridFocusZone('SetDirection', 'horizontal');
    // move to 2 with right arrow
    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(1), [Keys.ARROW_RIGHT]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(2), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    // down arrow shouldn't move focus
    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(2), [Keys.ARROW_DOWN]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(2), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    // left arrow goes back
    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(4), [Keys.ARROW_LEFT]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(3), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    expect(await FocusZonePageObject.didAssertPopup())
      .withContext(FocusZonePageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Navigates vertical focuszone using arrow keys. Validate focus switches correctly.', async () => {
    await FocusZonePageObject.configureGridFocusZone('SetDirection', 'vertical');

    // move to 2 with down arrow
    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(1), [Keys.ARROW_DOWN]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(2), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    // right arrow shouldn't move focus
    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(2), [Keys.ARROW_RIGHT]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(2), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    // up arrow goes back
    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(4), [Keys.ARROW_UP]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(3), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    expect(await FocusZonePageObject.didAssertPopup())
      .withContext(FocusZonePageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Navigates none-direction focuszone using arrow keys. Validate focus does not switch.', async () => {
    await FocusZonePageObject.configureGridFocusZone('SetDirection', 'none');

    // none of these key commands should move
    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(2), [Keys.ARROW_DOWN]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(2), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(2), [Keys.ARROW_UP]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(2), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(2), [Keys.ARROW_LEFT]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(2), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(2), [Keys.ARROW_RIGHT]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(2), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    expect(await FocusZonePageObject.didAssertPopup())
      .withContext(FocusZonePageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Navigates bi-directional focuszone with 2d navigation. Validate focus switches correctly.', async () => {
    await FocusZonePageObject.configureGridFocusZone('Set2DNavigation', true);

    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(1), [Keys.ARROW_DOWN]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(4), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(4), [Keys.ARROW_RIGHT]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(5), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    expect(await FocusZonePageObject.didAssertPopup())
      .withContext(FocusZonePageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});
