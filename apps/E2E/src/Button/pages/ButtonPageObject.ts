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
  async waitForOnClickCallbackToFire(errorMsg?: string): Promise<boolean> {
    await this.waitForCondition(async () => await this.onClickCallbackFired(), errorMsg ?? 'The Button onClick callback did not fire.');
    return await this.onClickCallbackFired();
  }

  async onClickCallbackFired(): Promise<boolean> {
    return await (await this._callbackText).isDisplayed();
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
