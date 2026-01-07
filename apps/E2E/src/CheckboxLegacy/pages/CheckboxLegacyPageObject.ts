import { BasePage, By } from '../../common/BasePage';
import { Attribute, AttributeValue } from '../../common/consts';
import {
  CHECKBOX_NO_A11Y_LABEL_COMPONENT,
  CHECKBOX_ON_PRESS,
  CHECKBOX_TESTPAGE,
  CHECKBOX_TEST_COMPONENT,
  HOMEPAGE_CHECKBOX_BUTTON,
} from '../consts';

class CheckboxLegacyPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async isCheckboxChecked(): Promise<boolean> {
    const checkbox = await this._primaryComponent;
    if (this.platform === 'windows') {
      // for native windows, .isSelected() always returns false. this is a workaround
      return (await checkbox.getAttribute(Attribute.ToggleState)) === AttributeValue.on;
    } else {
      return await checkbox.isSelected();
    }
  }

  /* Waits for the checkbox to be checked or unchecked if the new state is true or false. Returns true if the
   * checkbox toggled to the new state. */
  async waitForCheckboxToggle(newState: boolean, errorMessage: string): Promise<boolean | void> {
    return await this.waitForCondition(async () => (await this.isCheckboxChecked()) === newState, errorMessage);
  }

  /* Toggles the checkbox to the checked if newState == true or unchecked if newState == false. */
  async toggleCheckbox(newState: boolean) {
    if (await this.isCheckboxChecked() !== newState) {
      await this.click(this._primaryComponent);
      await this.waitForCheckboxToggle(
        newState,
        `Clicked the primary checkbox to turn it ${newState ? 'on' : 'off'}, but it failed to change states.`,
      );
    }
  }

  /* Unlike snapshot testing, we cannot spy on functions to determine if they get called or not. In order to determine if
   * the onChange() callback gets fired, we show / hide the a Text label as the callback gets fired. This way, we know that
   * the onChange() callback has fired by checking that the label element is currently displayed. */
  async didOnChangeCallbackFire(errorMsg: string): Promise<boolean | void> {
    const callbackText = await this._callbackText;
    return await this.waitForCondition(async () => await callbackText.isDisplayed(), errorMsg);
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return CHECKBOX_TESTPAGE;
  }

  get _primaryComponentName() {
    return CHECKBOX_TEST_COMPONENT;
  }

  get _secondaryComponentName() {
    return CHECKBOX_NO_A11Y_LABEL_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_CHECKBOX_BUTTON;
  }

  get _callbackText(): ChainablePromiseElement {
    return By(CHECKBOX_ON_PRESS);
  }
}

export default new CheckboxLegacyPageObject();
