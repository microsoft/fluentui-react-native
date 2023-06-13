import { BasePage, By } from '../../common/BasePage';
import { AndroidAttribute } from '../../common/consts';
import { CHIP_TESTPAGE, CHIP_TEST_COMPONENT, CHIP_TEXT, HOMEPAGE_CHIP_BUTTON } from '../consts';

class ChipPageObject extends BasePage {
  async getPrimaryComponentAttribute(attribute: string): Promise<string> {
    return await (await this._primaryComponent).getAttribute(attribute);
  }

  async getSecondaryComponentAttribute(attribute: string): Promise<string> {
    return await (await this._secondaryComponent).getAttribute(attribute);
  }

  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/

  //Android only
  async verifyTextContent(text: string): Promise<boolean> {
    const callbackText = await this._callbackText;
    return (await callbackText.getAttribute(AndroidAttribute.Text)) == text;
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

  get _callbackText() {
    return By(CHIP_TEXT);
  }
}

export default new ChipPageObject();
