import { BasePage, By } from '../../common/BasePage';
import { LINKV1_TESTPAGE, LINKV1_TEST_COMPONENT, HOMEPAGE_LINKV1_BUTTON, LINKV1_NO_A11Y_LABEL_COMPONENT } from '../consts';

class LinkV1PageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async didOnPressCallbackFire(errMsg: string): Promise<boolean | void> {
    const callbackText = By(LINKV1_NO_A11Y_LABEL_COMPONENT);
    return callbackText.waitForDisplayed({ timeoutMsg: errMsg });
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return LINKV1_TESTPAGE;
  }

  get _primaryComponentName() {
    return LINKV1_TEST_COMPONENT;
  }

  get _secondaryComponentName() {
    return LINKV1_NO_A11Y_LABEL_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_LINKV1_BUTTON;
  }
}

export default new LinkV1PageObject();
