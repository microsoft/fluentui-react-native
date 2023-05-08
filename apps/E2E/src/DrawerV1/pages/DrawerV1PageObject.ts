import { BasePage, By } from '../../common/BasePage';
import { AndroidAttribute } from '../../common/consts';
import {
  DrawerV1_TESTPAGE,
  DrawerV1_TEST_COMPONENT,
  HOMEPAGE_DrawerV1_BUTTON,
  DrawerV1_TEXT,
  DrawerV1_TEST_COMPONENT_DISMISS_BUTTON,
} from '../../DrawerV1/consts';

class DrawerV1PageObject extends BasePage {
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

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return DrawerV1_TESTPAGE;
  }

  get _primaryComponentName() {
    return DrawerV1_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_DrawerV1_BUTTON;
  }

  get _accessoryButton() {
    return By(DrawerV1_TEST_COMPONENT_DISMISS_BUTTON);
  }

  get _callbackText() {
    return By(DrawerV1_TEXT);
  }
}

export default new DrawerV1PageObject();
