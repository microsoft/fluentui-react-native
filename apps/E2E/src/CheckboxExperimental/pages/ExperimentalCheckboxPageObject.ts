import {
  HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON,
  EXPERIMENTAL_CHECKBOX_TESTPAGE,
  EXPERIMENTAL_CHECKBOX_TEST_COMPONENT,
  EXPERIMENTAL_CHECKBOX_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_CHECKBOX_ON_PRESS,
} from '../../../../fluent-tester/src/TestComponents/CheckboxExperimental/consts';
import { BasePage, By } from '../../common/BasePage';

class ExperimentalCheckboxPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async isCheckboxChecked(): Promise<boolean> {
    return await (await this._primaryComponent).isSelected();
  }

  async waitForCheckboxChecked(timeout?: number): Promise<void> {
    await this.waitForCondition(async () => await this.isCheckboxChecked(), 'The Checkbox was not toggled correctly.', timeout);
  }

  /* Useful in beforeEach() hook to reset the checkbox before every test */
  async toggleCheckboxToUnchecked(): Promise<void> {
    if (await this.isCheckboxChecked()) {
      await (await this._primaryComponent).click();
    }
  }

  async didOnChangeCallbackFire(): Promise<boolean> {
    const callbackText = await this._callbackText;
    await this.waitForCondition(async () => await callbackText.isDisplayed(), 'The onChange callback did not fire.');
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
}

export default new ExperimentalCheckboxPageObject();
