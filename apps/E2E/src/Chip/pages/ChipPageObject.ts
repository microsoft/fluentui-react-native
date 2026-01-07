import { BasePage, By } from '../../common/BasePage';
import { AndroidAttribute } from '../../common/consts';
import { CHIP_TESTPAGE, CHIP_TEST_COMPONENT, CHIP_TEXT, HOMEPAGE_CHIP_BUTTON } from '../consts';

class ChipPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async verifyTextContent(text: string): Promise<boolean> {
    return await this.compareAttribute(this._callbackText, AndroidAttribute.Text, text);
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageButtonName() {
    return HOMEPAGE_CHIP_BUTTON;
  }

  get _pageName() {
    return CHIP_TESTPAGE;
  }

  get _primaryComponentName() {
    return CHIP_TEST_COMPONENT;
  }

  get _callbackText(): ChainablePromiseElement {
    return By(CHIP_TEXT);
  }
}

export default new ChipPageObject();
