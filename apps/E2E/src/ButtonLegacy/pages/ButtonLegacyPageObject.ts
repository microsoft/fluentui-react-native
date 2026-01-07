import { BasePage, By } from '../../common/BasePage';
import {
  BUTTON_TESTPAGE,
  BUTTON_TEST_COMPONENT_DEPRECATED,
  BUTTON_NO_A11Y_LABEL_COMPONENT_DEPRECATED,
  HOMEPAGE_BUTTON_BUTTON,
  BUTTON_ON_PRESS_DEPRECATED,
} from '../consts';
class ButtonLegacyPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/

  async didOnClickCallbackFire(errorMsg: string): Promise<boolean | void> {
    const callbackText = await this._callbackText;
    return await this.waitForCondition(async () => await callbackText.isDisplayed(), errorMsg);
  }

  async resetTest(): Promise<void> {
    const callbackText = await this._callbackText;
    if (await callbackText.isDisplayed()) {
      await (await this._primaryComponent).click();
      await this.waitForCondition(
        async () => !(await callbackText.isDisplayed()),
        'Could not reset test: Clicked button to toggle onClick callback text, but the text failed to hide.',
      );
    }
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return BUTTON_TESTPAGE;
  }

  get _primaryComponentName() {
    return BUTTON_TEST_COMPONENT_DEPRECATED;
  }

  get _secondaryComponentName() {
    return BUTTON_NO_A11Y_LABEL_COMPONENT_DEPRECATED;
  }

  get _callbackText(): ChainablePromiseElement {
    return By(BUTTON_ON_PRESS_DEPRECATED);
  }

  get _pageButtonName() {
    return HOMEPAGE_BUTTON_BUTTON;
  }
}

export default new ButtonLegacyPageObject();
