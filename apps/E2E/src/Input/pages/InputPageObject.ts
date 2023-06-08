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
    const callbackText = await this._callbackText;
    return (await callbackText.getAttribute(AndroidAttribute.Text)) == text;
  }

  async typeText(text: string): Promise<void> {
    await driver.execute('mobile: type', { text: text });
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
