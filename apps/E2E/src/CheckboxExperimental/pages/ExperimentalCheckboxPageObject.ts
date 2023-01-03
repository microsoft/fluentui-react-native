import {
  HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON,
  EXPERIMENTAL_CHECKBOX_TESTPAGE,
  EXPERIMENTAL_CHECKBOX_TEST_COMPONENT,
  EXPERIMENTAL_CHECKBOX_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_CHECKBOX_ON_PRESS,
} from '../consts';
import { BasePage, By } from '../../common/BasePage';

class ExperimentalCheckboxPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async isCheckboxChecked(): Promise<boolean> {
    return await (await this._primaryComponent).isSelected();
  }

  /* Waits for the checkbox to be checked or unchecked if the new state is true or false. Returns true if the
   * checkbox toggled to the new state. */
  async waitForCheckboxToggle(newState: boolean, errorMessage?: string): Promise<boolean> {
    if ((await this.isCheckboxChecked()) !== newState) {
      await this.waitForCondition(async () => (await this.isCheckboxChecked()) === newState, errorMessage);
    }
    return (await this.isCheckboxChecked()) === newState;
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
  async didOnChangeCallbackFire(errorMsg?: string): Promise<boolean> {
    const callbackText = await this._callbackText;
    await this.waitForCondition(async () => await callbackText.isDisplayed(), errorMsg ?? 'The onChange callback did not fire.');
    return await callbackText.isDisplayed();
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(EXPERIMENTAL_CHECKBOX_TESTPAGE);
  }

  get _pageName() {
    return EXPERIMENTAL_CHECKBOX_TESTPAGE;
  }

  get _primaryComponent() {
    return By(EXPERIMENTAL_CHECKBOX_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(EXPERIMENTAL_CHECKBOX_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON);
  }

  get _callbackText() {
    return By(EXPERIMENTAL_CHECKBOX_ON_PRESS);
  }

  get _pageButtonName() {
    return HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON;
  }
}

export default new ExperimentalCheckboxPageObject();
