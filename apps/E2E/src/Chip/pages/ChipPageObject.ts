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

  /* Waits for the text content to get updated to new string.
   * Returns true if new string is attained. */
  async waitForStringUpdate(newState: string, errorMessage: string): Promise<boolean> {
    if (!(await this.verifyTextContent(newState))) {
      await this.waitForCondition(async () => await this.verifyTextContent(newState), errorMessage);
    }
    return await this.verifyTextContent(newState);
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
