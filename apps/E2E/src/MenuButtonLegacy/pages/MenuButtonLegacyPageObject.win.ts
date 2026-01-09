import { BasePage, By } from '../../common/BasePage';
import {
  HOMEPAGE_MENUBUTTON_BUTTON,
  MENU_BUTTON_NO_A11Y_LABEL_COMPONENT,
  MENU_BUTTON_TESTPAGE,
  MENU_BUTTON_TEST_COMPONENT,
  MENU_ITEM_1_COMPONENT,
} from '../consts';

class MenuButtonLegacyPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async waitForMenuItemToDisplay(errorMsg: string): Promise<boolean | void> {
    const menuItem = await this._menuItem;
    return await this.waitForCondition(async () => await menuItem.isDisplayed(), errorMsg);
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return MENU_BUTTON_TESTPAGE;
  }

  get _firstMenuButton() {
    return By(MENU_BUTTON_TEST_COMPONENT);
  }

  get _secondMenuButton() {
    return By(MENU_BUTTON_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_MENUBUTTON_BUTTON;
  }

  get _menuItem() {
    return By(MENU_ITEM_1_COMPONENT);
  }
}

export default new MenuButtonLegacyPageObject();
