import { BasePage, By } from '../../common/BasePage';
import { AndroidAttribute } from '../../common/consts';
import {
  INPUT_TESTPAGE,
  INPUT_TEST_COMPONENT,
  HOMEPAGE_INPUT_BUTTON,
  INPUT_TEXT,
  INPUT_TEST_COMPONENT_DISMISS_BUTTON,
} from '../../Input/consts';

class InputPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async verifyTextContent(text: string): Promise<boolean> {
    return await this.compareAttribute(this._callbackText, AndroidAttribute.Text, text);
  }

  async typeText(text: string): Promise<void> {
    await driver.execute('mobile: type', { text: text });
  }

  /* Waits for the text content to get updated to new string. */
  async waitForStringUpdate(newState: string, errorMessage: string): Promise<void> {
    await this.waitForCondition(async () => (await this._callbackText.getAttribute(AndroidAttribute.Text)) == newState, errorMessage);
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return INPUT_TESTPAGE;
  }

  get _primaryComponentName() {
    return INPUT_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_INPUT_BUTTON;
  }

  get _accessoryButton() {
    return By(INPUT_TEST_COMPONENT_DISMISS_BUTTON);
  }

  get _callbackText() {
    return By(INPUT_TEXT);
  }
}

export default new InputPageObject();
