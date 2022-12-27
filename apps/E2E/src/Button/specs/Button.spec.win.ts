import NavigateAppPage from '../../common/NavigateAppPage';
import ButtonPageObject from '../pages/ButtonPageObject';
import { PAGE_TIMEOUT, BOOT_APP_TIMEOUT, BUTTON_A11Y_ROLE, Keys, Attribute } from '../../common/consts';
import {
  BUTTON_ACCESSIBILITY_LABEL_DEPRECATED,
  BUTTON_TEST_COMPONENT_LABEL_DEPRECATED,
} from '../../../../fluent-tester/src/TestComponents/Button/consts';

// Before testing begins, allow up to 60 seconds for app to open
describe('Button Testing Initialization', function () {
  it('Wait for app load', async () => {
    await NavigateAppPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    await expect(await NavigateAppPage.isPageLoaded()).toBeTruthy(NavigateAppPage.ERRORMESSAGE_APPLOAD);
  });

  it('Click and navigate to Button test page', async () => {
    /* Click on component button to navigate to test page */
    await NavigateAppPage.clickAndGoToButtonPage();
    await ButtonPageObject.waitForPageDisplayed(PAGE_TIMEOUT);

    await expect(await ButtonPageObject.isPageLoaded()).toBeTruthy(ButtonPageObject.ERRORMESSAGE_PAGELOAD);
    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Button Accessibility Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonPageObject.scrollToTestElement();
  });

  it('Validate accessibilityRole is correct', async () => {
    await expect(
      await ButtonPageObject.compareAttribute(ButtonPageObject._primaryComponent, Attribute.AccessibilityRole, BUTTON_A11Y_ROLE),
    ).toBeTrue();

    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate "accessibilityLabel" is correct AFTER setting the "accessibilityLabel"', async () => {
    await expect(
      await ButtonPageObject.compareAttribute(
        ButtonPageObject._primaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_ACCESSIBILITY_LABEL_DEPRECATED,
      ),
    ).toBeTrue();

    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });

  it('Validate "accessibilityLabel" defaults to the button label AFTER NOT setting "accessibilityLabel"', async () => {
    await expect(
      await ButtonPageObject.compareAttribute(
        ButtonPageObject._secondaryComponent,
        Attribute.AccessibilityLabel,
        BUTTON_TEST_COMPONENT_LABEL_DEPRECATED,
      ),
    ).toBeTrue();

    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });
});

describe('Button Functional Testing', () => {
  /* Scrolls and waits for the Button to be visible on the Test Page */
  beforeEach(async () => {
    await ButtonPageObject.scrollToTestElement();
  });

  it('Validate onClick() callback was fired AFTER clicking the primary button', async () => {
    await ButtonPageObject.click(ButtonPageObject._primaryComponent);
    await expect(
      await ButtonPageObject.didOnClickCallbackFire('Clicking on the primary button failed to fire the onClick() callback.'),
    ).toBeTruthy();

    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);

    await ButtonPageObject.clickComponent(); // Reset Button State
  });

  it('Validate onClick() callback was fired AFTER typing "Enter" on the primary button', async () => {
    await ButtonPageObject.sendKeys(ButtonPageObject._primaryComponent, [Keys.ENTER]);
    await expect(
      await ButtonPageObject.didOnClickCallbackFire(
        "Pressing the 'Enter' key on the primary button failed to fire the onClick() callback.",
      ),
    ).toBeTruthy();
    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);

    await ButtonPageObject.clickComponent(); // Reset Button State
  });

  it('Validate onClick() callback was fired AFTER typing "Space" on the primary button', async () => {
    await ButtonPageObject.sendKeys(ButtonPageObject._primaryComponent, [Keys.SPACE]);
    await expect(
      await ButtonPageObject.didOnClickCallbackFire(
        "Pressing the 'Space' key on the primary button failed to fire the onClick() callback.",
      ),
    ).toBeTruthy();

    await expect(await ButtonPageObject.didAssertPopup()).toBeFalsy(ButtonPageObject.ERRORMESSAGE_ASSERT);
  });
});
