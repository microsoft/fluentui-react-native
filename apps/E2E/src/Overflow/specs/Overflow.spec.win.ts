import OverflowPageObject from '../pages/OverflowPageObject';

describe('Overflow Testing Initialization', () => {
  it('Wait for app load', async () => {
    expect(await OverflowPageObject.waitForInitialPageToDisplay()).toBeTrue();
  });

  it('Click and navigate to Overflow test page', async () => {
    expect(await OverflowPageObject.navigateToPageAndLoadTests()).toBeTrue();

    /* Expand E2E section */
    expect(await OverflowPageObject.enableE2ETesterMode()).toBeTrue();

    expect(await OverflowPageObject.didAssertPopup())
      .withContext(OverflowPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});

describe('Overflow Functional Testing', () => {
  beforeEach(async () => {
    await OverflowPageObject.scrollToTestElement(await OverflowPageObject._readyLabel);
    await OverflowPageObject.waitForOverflowToBeReady();
  });

  it('Set Overflow width to 375. Overflow renders all three items.', async () => {
    await OverflowPageObject.setOverflowWidth(375);
    await OverflowPageObject.waitForOverflowToBeUpdated();

    expect(
      await OverflowPageObject.itemIsVisible('First', 'Expected the first Overflow Item to be visible, but the item remained hidden.'),
    ).toBeTruthy();

    expect(
      await OverflowPageObject.itemIsVisible('Second', 'Expected the second Overflow Item to be visible, but the item remained hidden.'),
    ).toBeTruthy();

    expect(
      await OverflowPageObject.itemIsVisible('Third', 'Expected the third Overflow Item to be visible, but the item remained hidden.'),
    ).toBeTruthy();

    expect(await OverflowPageObject.didAssertPopup())
      .withContext(OverflowPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Set Overflow width to 275. Overflow renders first and second items, and the third is hidden.', async () => {
    await OverflowPageObject.setOverflowWidth(275);
    await OverflowPageObject.waitForOverflowToBeUpdated();

    expect(
      await OverflowPageObject.itemIsVisible('First', 'Expected the first Overflow Item to be visible, but the item remained hidden.'),
    ).toBeTruthy();

    expect(
      await OverflowPageObject.itemIsVisible('Second', 'Expected the second Overflow Item to be visible, but the item remained hidden.'),
    ).toBeTruthy();

    expect(
      await OverflowPageObject.menuIsDisplayed('Expected the overflow menu to be visible, but the menu remained hidden.'),
    ).toBeTruthy();

    expect(await OverflowPageObject.menuHasNHidden(1))
      .withContext('Expected the overflow menu to have one hidden item, but the menu has the incorrect number of items.')
      .toBeTruthy();

    expect(await OverflowPageObject.didAssertPopup())
      .withContext(OverflowPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });

  it('Set Overflow width to 175. Overflow renders first item, and the second and third are hidden.', async () => {
    await OverflowPageObject.setOverflowWidth(175);
    await OverflowPageObject.waitForOverflowToBeUpdated();

    expect(await OverflowPageObject.itemIsVisible('First'))
      .withContext('Expected the first Overflow Item to be visible, but the item remained hidden.')
      .toBeTruthy();

    expect(
      await OverflowPageObject.menuIsDisplayed('Expected the overflow menu to be visible, but the menu remained hidden.'),
    ).toBeTruthy();

    expect(await OverflowPageObject.menuHasNHidden(2))
      .withContext('Expected the overflow menu to have two hidden items, but the menu has the incorrect number of items.')
      .toBeTruthy();

    expect(await OverflowPageObject.didAssertPopup())
      .withContext(OverflowPageObject.ERRORMESSAGE_ASSERT)
      .toBeFalsy();
  });
});
