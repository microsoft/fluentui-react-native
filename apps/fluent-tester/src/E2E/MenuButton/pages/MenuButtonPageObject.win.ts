import {
  MENU_BUTTON_TESTPAGE,
  MENU_BUTTON_TEST_COMPONENT,
  HOMEPAGE_MENU_BUTTON,
  MENU_BUTTON_NO_A11Y_LABEL_COMPONENT,
  MENU_ITEM_1_COMPONENT,
} from '../../../FluentTester/TestComponents/MenuButton/consts';
import { BasePage, By } from '../../common/BasePage.win';

class MenuButtonPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  waitForMenuItemsToOpen(timeout?: number): void {
    browser.waitUntil(
      () => {
        return this.menuItemDisplayed();
      },
      {
        timeout: timeout ?? this.waitForPageTimeout,
        timeoutMsg: 'The Menu Items did not open.',
        interval: 1000,
      },
    );
  }

  /* Whether the menu item is displayed or not. It should be displayed after clicking on the MenuButton */
  menuItemDisplayed(): boolean {
    return this._menuItem.isDisplayed();
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
    return By(HOMEPAGE_MENU_BUTTON);
  }

  get _menuItem() {
    return By(MENU_ITEM_1_COMPONENT);
  }
}

export default new MenuButtonPageObject();
