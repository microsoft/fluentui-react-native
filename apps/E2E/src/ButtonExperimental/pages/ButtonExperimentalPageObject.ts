import { Attribute } from '../../common/consts';
import {
  BUTTON_TESTPAGE,
  BUTTON_TEST_COMPONENT,
  BUTTON_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_BUTTON_BUTTON,
  BUTTON_ON_PRESS,
} from '../../../../fluent-tester/src/TestComponents/Button/consts';
import { BasePage, By } from '../../common/BasePage';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The spec file should import this enum and use it when wanting to interact with different elements on the page. */
export const enum ButtonSelector {
  PrimaryButton, //this._primaryComponent
  SecondaryButton,
}
class ButtonExperimentalPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async didOnClickCallbackFire(): Promise<boolean> {
    const callbackText = await By(BUTTON_ON_PRESS);
    await browser.waitUntil(async () => await callbackText.isDisplayed(), {
      timeout: this.waitForUiEvent,
      timeoutMsg: 'The OnClick callback did not fire.',
      interval: 1000,
    });

    return await callbackText.isDisplayed();
  }

  /* Sends a Keyboarding command on a specific UI element */
  async sendKey(buttonSelector: ButtonSelector, key: string): Promise<void> {
    await (await this.getButtonSelector(buttonSelector)).addValue(key);
  }

  /* Returns the correct WebDriverIO element from the Button Selector */
  async getButtonSelector(buttonSelector?: ButtonSelector): Promise<WebdriverIO.Element> {
    switch (buttonSelector) {
      case ButtonSelector.PrimaryButton:
        return this._primaryComponent;
      case ButtonSelector.SecondaryButton:
        return this._secondaryComponent;
    }
  }

  async accessibilityLabelIsEqualTo(selector: ButtonSelector, expectedValue: any): Promise<boolean> {
    return this._attributeIsEqualTo(await this.getButtonSelector(selector), Attribute.AccessibilityLabel, expectedValue);
  }

  async accessibilityRoleIsEqualTo(selector: ButtonSelector, expectedValue: any): Promise<boolean> {
    return this._attributeIsEqualTo(await this.getButtonSelector(selector), Attribute.AccessibilityRole, expectedValue);
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(BUTTON_TESTPAGE);
  }

  get _pageName() {
    return BUTTON_TESTPAGE;
  }

  get _primaryComponent() {
    return By(BUTTON_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(BUTTON_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_BUTTON_BUTTON);
  }
}

export default new ButtonExperimentalPageObject();
