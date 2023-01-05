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
  async didOnClickCallbackFire(errorMsg: string): Promise<boolean> {
    const callbackText = await By(BUTTON_ON_PRESS);
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
    return By(BUTTON_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(BUTTON_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_BUTTON_BUTTON);
  }
}

export default new ButtonV1PageObject();
