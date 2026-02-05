import { BasePage, By } from '../../common/BasePage';
import { HOMEPAGE_SWITCH_BUTTON, SWITCH_NO_A11Y_LABEL_COMPONENT, SWITCH_ON_PRESS, SWITCH_TESTPAGE, SWITCH_TEST_COMPONENT } from '../consts';

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

  async waitForSwitchStateChange(newState: boolean, errorMsg: string): Promise<boolean | void> {
    return await this.waitForCondition(async () => (await this.isSwitchChecked()) === newState, errorMsg);
  }

  async waitForOnChangeCallbackToFire(errorMsg: string): Promise<boolean | void> {
    return this._callbackText.waitForDisplayed({ timeoutMsg: errorMsg });
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
