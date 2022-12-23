import {
  MENU_TESTPAGE,
  MENUTRIGGER_TEST_COMPONENT,
  MENUITEM_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_MENU_BUTTON,
  MENUITEM_TEST_COMPONENT,
  MENUPOPOVER_TEST_COMPONENT,
  MENUITEM_DISABLED_COMPONENT,
  MENUITEM_FOURTH_COMPONENT,
  MENU_CALLBACK_RESET_BUTTON,
  MENUITEM_CALLBACK_LABEL,
} from '../../../../fluent-tester/src/TestComponents/Menu/consts';
import { BasePage, By } from '../../common/BasePage';
import { Keys, Attribute, AttributeValue } from '../../common/consts';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The spec file should import this enum and use it when wanting to interact with different elements on the page. */
export const enum MenuComponentSelector {
  MenuTrigger = 0, //this._primaryComponent
  FirstMenuItem,
  SecondMenuItem,
  ThirdMenuItem,
  FourthMenuItem,
}

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
      await this.clickItem(MenuComponentSelector.MenuTrigger);
      await this.waitForMenuToOpen();
    }
  }

  async closeMenu(): Promise<void> {
    if (await this.menuIsExpanded()) {
      await this.sendKey(MenuComponentSelector.FirstMenuItem, Keys.ESCAPE);
      await this.waitForCondition(async () => (await this.menuIsExpanded()) === false, 'The Menu did not close.', this.waitForUiEvent, 500);
    }
  }

  async waitForMenuToOpen(): Promise<boolean> {
    await this.waitForCondition(async () => await this.menuIsExpanded(), 'The Menu did not open.', this.waitForUiEvent, 500);
    return await this.menuIsExpanded();
  }

  async menuIsExpanded(): Promise<boolean> {
    const menuItem = await this._firstMenuItem;
    if (menuItem.error) {
      // Not displayed because the item can't be found by appium
      return false;
    }
    return await menuItem.isDisplayed();
  }

  async waitForItemCallbackToFire(timesFired: number): Promise<void> {
    await this.waitForCondition(
      async () => await this.itemOnClickHasFired(timesFired),
      `MenuItem callback failed to fire ${timesFired} times.`,
      this.waitForUiEvent,
      500,
    );
  }

  async itemOnClickHasFired(timesFired: number): Promise<boolean> {
    return (await (await this._callbackLabel).getText()).includes(timesFired.toString());
  }

  async componentIsFocused(selector: MenuComponentSelector): Promise<boolean> {
    const component = await this.getMenuComponentSelector(selector);
    return (await this.getElementAttribute(component, Attribute.IsFocused)) === AttributeValue.true;
  }

  async getMenuExpandCollapseState(): Promise<AttributeValue> {
    return (await this.getElementAttribute(await this._primaryComponent, Attribute.ExpandCollapseState)) as AttributeValue;
  }

  async getMenuItemAccessibilityLabel(componentSelector: MenuComponentSelector): Promise<string> {
    return await this.getElementAttribute(await this.getMenuComponentSelector(componentSelector), Attribute.AccessibilityLabel);
  }

  async getMenuAccessibilityRole(): Promise<string> {
    return await this.getElementAttribute(await By(MENUPOPOVER_TEST_COMPONENT), Attribute.AccessibilityRole);
  }

  async getMenuItemAccessibilityRole(): Promise<string> {
    return await this.getElementAttribute(await this._firstMenuItem, Attribute.AccessibilityRole);
  }

  /* Sends a Keyboarding command on a specific UI element */
  async sendKey(menuComponentSelector: MenuComponentSelector, key: string): Promise<void> {
    await (await this.getMenuComponentSelector(menuComponentSelector)).addValue(key);
  }

  // Renaming this function until Menu tests are refactored to use BasePage methods.
  async clickItem(selector: MenuComponentSelector): Promise<void> {
    await (await this.getMenuComponentSelector(selector)).click();
  }

  /* Returns the correct WebDriverIO element from the Button Selector */
  async getMenuComponentSelector(menuComponentSelector: MenuComponentSelector): Promise<WebdriverIO.Element> {
    switch (menuComponentSelector) {
      case MenuComponentSelector.MenuTrigger:
        return await this._primaryComponent;
      case MenuComponentSelector.FirstMenuItem:
        return await this._firstMenuItem;
      case MenuComponentSelector.SecondMenuItem:
        return await this._secondMenuItem;
      case MenuComponentSelector.ThirdMenuItem:
        return await this._thirdMenuItem;
      case MenuComponentSelector.FourthMenuItem:
        return await this._fourthMenuItem;
    }
  }

  async resetTest() {
    // Both escape on the menu trigger to hard dismiss menu and click callback reset to reset focus
    await this.closeMenu();
    await (await this._callbackResetButton).click();
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(MENU_TESTPAGE);
  }

  get _pageName() {
    return MENU_TESTPAGE;
  }

  get _primaryComponent() {
    return By(MENUTRIGGER_TEST_COMPONENT);
  }

  get _firstMenuItem() {
    return By(MENUITEM_TEST_COMPONENT);
  }

  get _secondMenuItem() {
    return By(MENUITEM_DISABLED_COMPONENT);
  }

  get _thirdMenuItem() {
    return By(MENUITEM_NO_A11Y_LABEL_COMPONENT);
  }

  get _fourthMenuItem() {
    return By(MENUITEM_FOURTH_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_MENU_BUTTON);
  }

  get _callbackResetButton() {
    return By(MENU_CALLBACK_RESET_BUTTON);
  }

  get _callbackLabel() {
    return By(MENUITEM_CALLBACK_LABEL);
  }
}

export default new MenuPageObject();
