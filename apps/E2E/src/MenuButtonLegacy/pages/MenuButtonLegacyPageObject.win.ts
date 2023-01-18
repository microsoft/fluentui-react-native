import {
  MENU_BUTTON_TESTPAGE,
  MENU_BUTTON_TEST_COMPONENT,
  HOMEPAGE_MENUBUTTON_BUTTON,
  MENU_BUTTON_NO_A11Y_LABEL_COMPONENT,
  MENU_ITEM_1_COMPONENT,
} from '../consts';
import { BasePage, By } from '../../common/BasePage';

export const enum MenuButtonSelector {
  MenuButton = 0, // this._primarySelector
  MenuItem1, // this._menuItem
}

class MenuButtonLegacyPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async waitForMenuItemToDisplay(errorMsg: string): Promise<boolean> {
    const menuItem = await this._menuItem;
    await this.waitForCondition(async () => await menuItem.isDisplayed(), errorMsg);
    return await menuItem.isDisplayed();
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
