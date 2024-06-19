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
 * These tests validate Circular Navigation, disabled FZ, and tab with/without default tabbable element.
 *
 * */
describe('FocusZone Functional Testing', () => {
  beforeEach(async () => {
    await FocusZonePageObject.scrollToTestElement();

    await FocusZonePageObject.resetTest();
  });

  it("Navigates focuszone with circular navigation off. Validate focus between start and end doesn't switch.", async () => {
    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(1), [Keys.ARROW_LEFT]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(1), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(9), [Keys.ARROW_RIGHT]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(9), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    expect(await FocusZonePageObject.didAssertPopup())
      .withContext(FocusZonePageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Navigates focuszone with circular navigation on. Validate focus between start and end switches.', async () => {
    await FocusZonePageObject.configureGridFocusZone('SetCircularNavigation', true);

    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(1), [Keys.ARROW_LEFT]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(9), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(9), [Keys.ARROW_RIGHT]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(1), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    expect(await FocusZonePageObject.didAssertPopup())
      .withContext(FocusZonePageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Navigates disabled focuszone by arrow keys. Validate focus switches correctly.', async () => {
    await FocusZonePageObject.configureGridFocusZone('Disable', true);

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

  it('Tabs in and out of the FocusZone. Validate focus switches correctly.', async () => {
    await FocusZonePageObject.sendKeys(FocusZonePageObject._beforeButton, [Keys.TAB]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(1), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(1), [Keys.TAB]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject._afterButton, Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await FocusZonePageObject.sendKeys(FocusZonePageObject._afterButton, [Keys.SHIFT, Keys.TAB]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(9), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(9), [Keys.SHIFT, Keys.TAB]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject._beforeButton, Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    expect(await FocusZonePageObject.didAssertPopup())
      .withContext(FocusZonePageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Tabs in and out of the FocusZone with a defaultTabbableElement set. Validate focus switches to the defaultTabbableElement.', async () => {
    // This sets the defaultTabbableElement prop of the FocusZone to be grid button #4. Whenever a user tabs into the zone, button 4 should always be the first to be selected.
    await FocusZonePageObject.configureGridFocusZone('UseDefaultTabbableElement', true);

    await FocusZonePageObject.sendKeys(FocusZonePageObject._beforeButton, [Keys.TAB]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(4), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(4), [Keys.TAB]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject._afterButton, Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await FocusZonePageObject.sendKeys(FocusZonePageObject._afterButton, [Keys.SHIFT, Keys.TAB]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(4), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    // Key to another button, tab out, and tab back in to make sure the default tabbable element is still the first to be tabbed to
    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(4), [Keys.ARROW_RIGHT]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(5), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await FocusZonePageObject.sendKeys(FocusZonePageObject.gridButton(5), [Keys.SHIFT, Keys.TAB]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject._beforeButton, Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    await FocusZonePageObject.sendKeys(FocusZonePageObject._beforeButton, [Keys.TAB]);
    expect(
      await FocusZonePageObject.compareAttribute(FocusZonePageObject.gridButton(4), Attribute.IsFocused, AttributeValue.true),
    ).toBeTruthy();

    expect(await FocusZonePageObject.didAssertPopup())
      .withContext(FocusZonePageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});
