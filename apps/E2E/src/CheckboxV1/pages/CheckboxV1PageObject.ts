import { BasePage, By } from '../../common/BasePage';
import {
  HOMEPAGE_CHECKBOXV1_BUTTON,
  CHECKBOXV1_TESTPAGE,
  CHECKBOXV1_TEST_COMPONENT,
  CHECKBOXV1_NO_A11Y_LABEL_COMPONENT,
  CHECKBOXV1_ON_PRESS,
} from '../consts';

class CheckboxV1PageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async isCheckboxChecked(): Promise<boolean> {
    return await (await this._primaryComponent).isSelected();
  }

  /* Waits for the checkbox to be checked or unchecked if the new state is true or false. Returns true if the
   * checkbox toggled to the new state. */
  async waitForCheckboxToggle(newState: boolean, errorMessage: string): Promise<boolean | void> {
    return await this.waitForCondition(async () => (await this.isCheckboxChecked()) === newState, errorMessage);
  }

  /* Waits for the checkbox to be checked or unchecked if the new state is true or false. Returns true if the
   * checkbox toggled to the new state. */
  async waitForCheckboxToggleAndroid(newState: boolean, errorMessage: string): Promise<boolean> {
    if ((await this.isCheckboxCheckedAndroid()) !== newState) {
      await this.waitForCondition(async () => (await this.isCheckboxCheckedAndroid()) === newState, errorMessage);
    }
    return (await this.isCheckboxCheckedAndroid()) === newState;
  }

  async isCheckboxCheckedAndroid(): Promise<boolean> {
    return (await (await this._primaryComponent).getAttribute('checked')) === 'true';
  }

  /* Toggles the checkbox to the checked if newState == true or unchecked if newState == false. */
  async toggleCheckbox(newState: boolean) {
    if ((await this.isCheckboxChecked()) !== newState) {
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
    return CHECKBOXV1_TESTPAGE;
  }

  get _primaryComponentName() {
    return CHECKBOXV1_TEST_COMPONENT;
  }

  get _secondaryComponentName() {
    return CHECKBOXV1_NO_A11Y_LABEL_COMPONENT;
  }

  get _callbackText(): ChainablePromiseElement {
    return By(CHECKBOXV1_ON_PRESS);
  }

  get _pageButtonName() {
    return HOMEPAGE_CHECKBOXV1_BUTTON;
  }
}

export default new CheckboxV1PageObject();
