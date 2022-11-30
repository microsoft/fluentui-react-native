import {
  SWITCH_TESTPAGE,
  SWITCH_TEST_COMPONENT,
  SWITCH_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_SWITCH_BUTTON,
  SWITCH_ON_PRESS,
} from '../../../../fluent-tester/src/TestComponents/Switch/consts';
import { BasePage, By } from '../../common/BasePage';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The spec file should import this enum and use it when wanting to interact with different elements on the page. */
export const enum SwitchComponentSelector {
  PrimaryComponent, //this._primaryComponent
  SecondaryComponent, // this._secondaryComponent
}

class SwitchPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async isSwitchChecked(): Promise<boolean> {
    return await (await this._primaryComponent).isSelected();
  }

  async waitForSwitchChecked(timeout?: number): Promise<void> {
    browser.waitUntil(async () => await this.isSwitchChecked(), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg: 'The Switch was not toggled correctly',
      interval: 1000,
    });
  }

  async toggleSwitchToUnchecked(): Promise<void> {
    if (await this.isSwitchChecked()) {
      await (await this._primaryComponent).click();
    }
  }

  async didOnChangeCallbackFire(): Promise<boolean> {
    const callbackText = await By(SWITCH_ON_PRESS);
    browser.waitUntil(async () => await callbackText.isDisplayed(), {
      timeout: this.waitForUiEvent,
      timeoutMsg: 'The OnChange callback did not fire.',
      interval: 1000,
    });

    return await callbackText.isDisplayed();
  }

  /* Sends a Keyboarding command on a specific UI element */
  async sendKey(switchSelector: SwitchComponentSelector, key: string): Promise<void> {
    await (await this.getButtonSelector(switchSelector)).addValue(key);
  }

  /* Returns the correct WebDriverIO element from the Button Selector */
  async getButtonSelector(switchSelector?: SwitchComponentSelector): Promise<WebdriverIO.Element> {
    if (switchSelector == SwitchComponentSelector.PrimaryComponent) {
      return await this._primaryComponent;
    } else if (switchSelector === SwitchComponentSelector.SecondaryComponent) {
      return await this._secondaryComponent;
    }
    return await this._primaryComponent;
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(SWITCH_TESTPAGE);
  }

  get _pageName() {
    return SWITCH_TESTPAGE;
  }

  get _primaryComponent() {
    return By(SWITCH_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(SWITCH_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_SWITCH_BUTTON);
  }
}

export default new SwitchPageObject();
