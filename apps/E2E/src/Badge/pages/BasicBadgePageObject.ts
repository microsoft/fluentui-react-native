import { AndroidAttribute } from 'src/index.consts';

import { BasePage, By } from '../../common/BasePage';
import { BADGE_SECONDARY_TEST_COMPONENT, BADGE_TESTPAGE, BADGE_TEST_COMPONENT, BADGE_TEXT, HOMEPAGE_BADGE_BUTTON } from '../consts';

class BasicBadgePageObject extends BasePage {
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
    return HOMEPAGE_BADGE_BUTTON;
  }

  get _pageName() {
    return BADGE_TESTPAGE;
  }

  get _primaryComponentName() {
    return BADGE_TEST_COMPONENT;
  }

  get _secondaryComponentName() {
    return BADGE_SECONDARY_TEST_COMPONENT;
  }

  get _callbackText() {
    return By(BADGE_TEXT);
  }
}

export default new BasicBadgePageObject();
