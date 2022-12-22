import {
  BUTTON_TESTPAGE,
  BUTTON_TEST_COMPONENT_DEPRECATED,
  BUTTON_NO_A11Y_LABEL_COMPONENT_DEPRECATED,
  HOMEPAGE_BUTTON_BUTTON,
  BUTTON_ON_PRESS_DEPRECATED,
} from '../../../../fluent-tester/src/TestComponents/Button/consts';
import { BasePage, By } from '../../common/BasePage';
class ButtonPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/

  async didOnClickCallbackFire(errorMsg?: string): Promise<boolean> {
    const callbackText = await this._callbackText;
    await this.waitForCondition(async () => await callbackText.isDisplayed(), errorMsg ?? 'The onClick callback did not fire.');
    return await callbackText.isDisplayed();
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(BUTTON_TESTPAGE);
  }

  get _pageName() {
    return BUTTON_TESTPAGE;
  }

  get _primaryComponent() {
    return By(BUTTON_TEST_COMPONENT_DEPRECATED);
  }

  get _secondaryComponent() {
    return By(BUTTON_NO_A11Y_LABEL_COMPONENT_DEPRECATED);
  }

  get _pageButton() {
    return By(HOMEPAGE_BUTTON_BUTTON);
  }

  get _callbackText() {
    return By(BUTTON_ON_PRESS_DEPRECATED);
  }
}

export default new ButtonPageObject();
