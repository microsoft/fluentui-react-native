import {
  BUTTON_TESTPAGE,
  BUTTON_TEST_COMPONENT,
  BUTTON_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_BUTTON_BUTTON,
  BUTTON_ON_PRESS,
} from '../../ButtonLegacy/consts';
import { BasePage, By } from '../../common/BasePage';
class ButtonV1PageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async waitForOnClickCallbackToFire(errorMsg: string): Promise<boolean | void> {
    return this._callbackText.waitForDisplayed({ timeoutMsg: errorMsg });
  }

  async resetTest(): Promise<void> {
    if (await this._callbackText.isDisplayed()) {
      await this._primaryComponent.click();
      await this._callbackText.waitForDisplayed({
        reverse: true,
        timeoutMsg: 'Could not reset test: Clicked button to toggle onClick callback text, but the text failed to hide.',
      });
    }
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return BUTTON_TESTPAGE;
  }

  get _primaryComponentName() {
    return BUTTON_TEST_COMPONENT;
  }

  get _secondaryComponentName() {
    return BUTTON_NO_A11Y_LABEL_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_BUTTON_BUTTON;
  }

  get _callbackText() {
    return By(BUTTON_ON_PRESS);
  }
}

export default new ButtonV1PageObject();
