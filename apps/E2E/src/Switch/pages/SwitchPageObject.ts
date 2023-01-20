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
      await this.waitForSwitchStateChange(
        toggleState,
        `Clicked primary switch to turn it ${toggleState ? 'on' : 'off'}, but it failed to toggle.`,
      );
    }
  }

  async isSwitchChecked(): Promise<boolean> {
    return await (await this._primaryComponent).isSelected();
  }

  async waitForSwitchStateChange(newState: boolean, errorMsg: string): Promise<boolean> {
    await this.waitForCondition(async () => (await this.isSwitchChecked()) === newState, errorMsg);
    return (await this.isSwitchChecked()) === newState;
  }

  async waitForOnChangeCallbackToFire(errorMsg: string): Promise<boolean> {
    const callbackText = await this._callbackText;
    await this.waitForCondition(async () => await callbackText.isDisplayed(), errorMsg);
    return await callbackText.isDisplayed();
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return SWITCH_TESTPAGE;
  }

  get _primaryComponentName() {
    return SWITCH_TEST_COMPONENT;
  }

  get _secondaryComponentName() {
    return SWITCH_NO_A11Y_LABEL_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_SWITCH_BUTTON;
  }

  get _callbackText() {
    return By(SWITCH_ON_PRESS);
  }
}

export default new SwitchPageObject();
