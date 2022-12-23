import {
  MENU_BUTTON_TESTPAGE,
  MENU_BUTTON_TEST_COMPONENT,
  HOMEPAGE_MENUBUTTON_BUTTON,
  MENU_BUTTON_NO_A11Y_LABEL_COMPONENT,
  MENU_ITEM_1_COMPONENT,
} from '../../../../fluent-tester/src/TestComponents/MenuButton/consts';
import { BasePage, By } from '../../common/BasePage';

export const enum MenuButtonSelector {
  MenuButton = 0, // this._primarySelector
  MenuItem1, // this._menuItem
}

class MenuButtonPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async waitForMenuItemsToOpen(timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await this.menuItemDisplayed(), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg: 'The Menu Items did not open.',
      interval: 1000,
    });
  }

  /* Whether the menu item is displayed or not. It should be displayed after clicking on the MenuButton */
  async menuItemDisplayed(): Promise<boolean> {
    return await (await this._menuItem).isDisplayed();
  }

  /* Sends a Keyboarding command on a specific UI element */
  async sendKey(selector: MenuButtonSelector, key: string): Promise<void> {
    await (await this.getMenuButtonSelector(selector)).addValue(key);
  }

  /* Returns the correct WebDriverIO element from the MenuButton Selector */
  async getMenuButtonSelector(selector?: MenuButtonSelector): Promise<WebdriverIO.Element> {
    if (selector == MenuButtonSelector.MenuButton) {
      return await this._primaryComponent;
    } else if (selector == MenuButtonSelector.MenuItem1) {
      return await this._menuItem;
    }
    return await this._primaryComponent;
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(MENU_BUTTON_TESTPAGE);
  }

  get _pageName() {
    return MENU_BUTTON_TESTPAGE;
  }

  get _primaryComponent() {
    return By(MENU_BUTTON_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(MENU_BUTTON_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_MENUBUTTON_BUTTON);
  }

  get _menuItem() {
    return By(MENU_ITEM_1_COMPONENT);
  }
}

export default new MenuButtonPageObject();
