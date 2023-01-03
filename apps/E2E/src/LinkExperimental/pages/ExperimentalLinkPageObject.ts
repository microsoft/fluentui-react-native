import {
  EXPERIMENTAL_LINK_TESTPAGE,
  EXPERIMENTAL_LINK_TEST_COMPONENT,
  HOMEPAGE_EXPERIMENTAL_LINK_BUTTON,
  EXPERIMENTAL_LINK_NO_A11Y_LABEL_COMPONENT,
} from '../consts';
import { BasePage, By } from '../../common/BasePage';

class ExperimentalLinkPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async didOnPressCallbackFire(errMsg: string): Promise<boolean> {
    const callbackText = await By(EXPERIMENTAL_LINK_NO_A11Y_LABEL_COMPONENT);
    await browser.waitUntil(async () => await callbackText.isDisplayed(), {
      timeout: this.waitForUiEvent,
      timeoutMsg: errMsg,
      interval: 1000,
    });

    return await callbackText.isDisplayed();
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(EXPERIMENTAL_LINK_TESTPAGE);
  }

  get _pageName() {
    return EXPERIMENTAL_LINK_TESTPAGE;
  }

  get _primaryComponent() {
    return By(EXPERIMENTAL_LINK_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(EXPERIMENTAL_LINK_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_EXPERIMENTAL_LINK_BUTTON);
  }
}

export default new ExperimentalLinkPageObject();
