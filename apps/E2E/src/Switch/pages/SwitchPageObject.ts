import { SWITCH_TESTPAGE, SWITCH_TEST_COMPONENT, SWITCH_NO_A11Y_LABEL_COMPONENT, HOMEPAGE_SWITCH_BUTTON, SWITCH_ON_PRESS } from '../consts';
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
  async setSwitchState(toggleState: boolean) {
    const currState = await this.isSwitchChecked();
    if (toggleState !== currState) {
      await (await this._primaryComponent).click();
      await this.waitForCondition(
        async () => toggleState === (await this.isSwitchChecked()),
        `Clicked the primary switch to turn it ${toggleState ? 'on' : 'off'}, but the switch failed to toggle.`,
      );
    }
  }

  async isSwitchChecked(): Promise<boolean> {
    return await (await this._primaryComponent).isSelected();
  }

  async waitForSwitchStateChange(newState: boolean, errorMsg: string, timeout?: number): Promise<boolean> {
    this.waitForCondition(async () => (await this.isSwitchChecked()) === newState, errorMsg, timeout);
    return (await this.isSwitchChecked()) === newState;
  }

  async waitForOnChangeCallbackToFire(errorMsg: string): Promise<boolean> {
    const callbackText = await this._callbackText;
    this.waitForCondition(async () => await callbackText.isDisplayed(), errorMsg);
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

  get _callbackText() {
    return By(SWITCH_ON_PRESS);
  }
}

export default new SwitchPageObject();
