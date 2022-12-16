import {
  CHECKBOX_TESTPAGE,
  CHECKBOX_TEST_COMPONENT,
  CHECKBOX_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_CHECKBOX_BUTTON,
  CHECKBOX_ON_PRESS,
} from '../../../../fluent-tester/src/TestComponents/Checkbox/consts';
import { BasePage, By } from '../../common/BasePage';

class CheckboxPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async isCheckboxChecked(): Promise<boolean> {
    return await (await this._primaryComponent).isSelected();
  }

  async waitForCheckboxChecked(timeout?: number): Promise<void> {
    await this.waitForCondition(async () => await this.isCheckboxChecked(), 'The Checkbox was not toggled correctly.', timeout);
  }

  async setCheckboxCheckState(setChecked: boolean) {
    const state = await this.isCheckboxChecked();
    if (state !== setChecked) {
      await this.click(this._primaryComponent);
      await this.waitForCondition(
        async () => (await this.isCheckboxChecked()) === setChecked,
        `Clicked the primary checkbox to turn it ${setChecked ? 'on' : 'off'}, but it failed to change.`,
      );
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
    return By(CHECKBOX_TESTPAGE);
  }

  get _pageName() {
    return CHECKBOX_TESTPAGE;
  }

  get _primaryComponent() {
    return By(CHECKBOX_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(CHECKBOX_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_CHECKBOX_BUTTON);
  }

  get _callbackText() {
    return By(CHECKBOX_ON_PRESS);
  }
}

export default new CheckboxPageObject();
