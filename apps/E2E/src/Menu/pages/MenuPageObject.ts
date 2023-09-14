import { BasePage, By } from '../../common/BasePage';
import { Keys } from '../../common/consts';
import {
  HOMEPAGE_MENU_BUTTON,
  MENUITEM_CALLBACK_LABEL,
  MENUITEM_DISABLED_COMPONENT,
  MENUITEM_FOURTH_COMPONENT,
  MENUITEM_NO_A11Y_LABEL_COMPONENT,
  MENUITEM_TEST_COMPONENT,
  MENUTRIGGER_TEST_COMPONENT,
  MENU_CALLBACK_RESET_BUTTON,
  MENU_TESTPAGE,
} from '../consts';

/** Allows a caller to get specific menu items using .getMenuItem() */
type MenuItem = 'First' | 'Second' | 'Third' | 'Fourth';

class MenuPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/

  /** On the topic of openMenu() and closeMenu() being two methods, it is a fair suggestion to say that these can be combined into
   *  a single function call. However, I think that separating these actions because (1) the actions to open vs close the menu are
   *  different enough compared to a toggleable like checkbox and (2) readability - it is easier to understand MenuPageObject.openMenu()
   *  vs MenuPageObject.setMenuState(AttributeValue.expanded) and vice-versa with close.
   */
  async openMenu(): Promise<void> {
    if (!(await this.menuIsExpanded())) {
      await this.click(this._menuTrigger);
      await this.waitForMenuToOpen();
    }
  }

  async closeMenu(): Promise<void> {
    if (await this.menuIsExpanded()) {
      await this.sendKeys(this.getMenuItem('First'), [Keys.ESCAPE]);
      await this.waitForMenuToClose();
    }
  }

  /* Waits for menuitems to be visible. This is a separate method from openMenu() because we test multiple ways of opening the menu (mouse + keyboard). */
  async waitForMenuToOpen(errorMsg?: string): Promise<boolean | void> {
    return await this.waitForCondition(
      async () => await this.menuIsExpanded(),
      errorMsg ?? 'The Menu did not open: It looks like the MenuItems failed to display.',
      this.waitForUiEvent,
      500,
    );
  }

  /* Same as above -> Just waits for menuitems to not be visible. */
  async waitForMenuToClose(errorMsg?: string): Promise<boolean | void> {
    return await this.waitForCondition(
      async () => !(await this.menuIsExpanded()),
      errorMsg ?? 'The Menu did not close: It looks like the MenuItems are still displayed.',
      this.waitForUiEvent,
      500,
    );
  }

  /* If the first item is displayed, then it's safe to say that the rest of the menu is expanded. */
  async menuIsExpanded(): Promise<boolean> {
    const menuItem = await this.getMenuItem('First');
    if (menuItem.error) {
      // Not displayed because the item can't be found by appium
      return false;
    }
    return await menuItem.isDisplayed();
  }

  /* Waits for the onClick callback of menu item 1 to fire. */
  async waitForItemCallbackToFire(timesFired: number, errorMsg?: string): Promise<boolean | void> {
    return await this.waitForCondition(
      async () => await this.itemOnClickHasFired(timesFired),
      errorMsg ?? `MenuItem callback failed to fire ${timesFired} times.`,
      this.waitForUiEvent,
      500,
    );
  }

  /* When menu item 1 is clicked, it increments a counter variable in the test component page, which is displayed in a text box. Incrementing a counter within a label
   * allows us to test whether the onClick() callback fires for click and keypress inputs across individual test cases without having to close the menu and reset the
   * label per case (as you see in the button + checkbox tests). This decreases test time and improves performance for this spec. */
  async itemOnClickHasFired(timesFired: number): Promise<boolean> {
    return (await (await this._callbackLabel).getText()) === `onClick fired ${timesFired} times`;
  }

  async getMenuItem(item: MenuItem): Promise<WebdriverIO.Element> {
    switch (item) {
      case 'First':
        return await By(MENUITEM_TEST_COMPONENT);
      case 'Second':
        return await By(MENUITEM_DISABLED_COMPONENT);
      case 'Third':
        return await By(MENUITEM_NO_A11Y_LABEL_COMPONENT);
      case 'Fourth':
        return await By(MENUITEM_FOURTH_COMPONENT);
    }
  }

  /* Closes the menu and resets the counter to 0 on the test page. */
  async resetTest() {
    // Both escape on the menu trigger to hard dismiss menu and click callback reset to reset focus
    await this.closeMenu();
    await (await this._callbackResetButton).click();
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return MENU_TESTPAGE;
  }

  get _menuTrigger() {
    return By(MENUTRIGGER_TEST_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_MENU_BUTTON;
  }

  get _callbackResetButton() {
    return By(MENU_CALLBACK_RESET_BUTTON);
  }

  get _callbackLabel() {
    return By(MENUITEM_CALLBACK_LABEL);
  }
}

export default new MenuPageObject();
