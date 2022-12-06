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
  MENUITEM_CALLBACK_TEXT,
} from '../../../../fluent-tester/src/TestComponents/Menu/consts';
import { BasePage, By } from '../../common/BasePage';
import { Keys, ExpandCollapseState, Attribute, AttributeValue } from '../../common/consts';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The spec file should import this enum and use it when wanting to interact with different elements on the page. */
export const enum MenuComponentSelector {
  PrimaryComponent = 0, //this._primaryComponent
  SecondaryComponent, //this._secondaryComponent
  TertiaryComponent, //this._tertiaryComponent
  QuaternaryComponent, // this._quaternaryComponent
  QuinternaryComponent, // this._quinternaryComponent
}

class MenuPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async waitForMenuToOpen(): Promise<void> {
    await this.waitForCondition(async () => await this.menuIsExpanded(), 'The Menu did not open.', this.waitForUiEvent);
  }

  async didMenuOpen(): Promise<boolean> {
    await this.waitForMenuToOpen();
    return await this.menuIsExpanded();
  }

  async menuIsExpanded(): Promise<boolean> {
    return await (await this._secondaryComponent).isDisplayed();
  }

  async waitForItemCallbackToFire(): Promise<void> {
    await this.waitForCondition(async () => await this.didItemCallbackFire(), 'MenuItem callback failed to fire.', this.waitForUiEvent);
  }

  async didItemCallbackFire(): Promise<boolean> {
    return (await (await this._callbackLabel).getText()) === MENUITEM_CALLBACK_TEXT;
  }

  async itemIsFocused(itemPosition: number): Promise<boolean> {
    const component = await this.getMenuComponentSelector(this.getItemSelector(itemPosition));
    const res = await this.getElementAttribute(component, Attribute.IsFocused);
    console.log(res);
    return res === AttributeValue.true;
  }

  async getMenuExpandCollapseState(): Promise<ExpandCollapseState> {
    return (await this.getElementAttribute(await this._primaryComponent, Attribute.ExpandCollapseState)) as ExpandCollapseState;
  }

  async getMenuItemAccessibilityLabel(componentSelector: MenuComponentSelector): Promise<string> {
    return await this.getElementAttribute(await this.getMenuComponentSelector(componentSelector), Attribute.AccessibilityLabel);
  }

  async getMenuAccessibilityRole(): Promise<string> {
    return await this.getElementAttribute(await By(MENUPOPOVER_TEST_COMPONENT), Attribute.AccessibilityRole);
  }

  async getMenuItemAccessibilityRole(): Promise<string> {
    return await this.getElementAttribute(await this._secondaryComponent, Attribute.AccessibilityRole);
  }

  /* Sends a Keyboarding command on a specific UI element */
  async sendKey(menuComponentSelector: MenuComponentSelector, key: string): Promise<void> {
    await (await this.getMenuComponentSelector(menuComponentSelector)).addValue(key);
  }

  async clickComponent(menuComponentSelector?: MenuComponentSelector): Promise<void> {
    const selector = menuComponentSelector ?? MenuComponentSelector.PrimaryComponent;
    await (await this.getMenuComponentSelector(selector)).click();
  }

  /* Returns the correct WebDriverIO element from the Button Selector */
  async getMenuComponentSelector(menuComponentSelector?: MenuComponentSelector): Promise<WebdriverIO.Element> {
    switch (menuComponentSelector) {
      case MenuComponentSelector.SecondaryComponent:
        return await this._secondaryComponent;
      case MenuComponentSelector.TertiaryComponent:
        return await this._tertiaryComponent;
      case MenuComponentSelector.QuaternaryComponent:
        return await this._quaternaryComponent;
      case MenuComponentSelector.QuinternaryComponent:
        return await this._quinternaryComponent;
      default:
        return await this._primaryComponent;
    }
  }

  async resetTest() {
    // Both escape on the menu trigger to hard dismiss menu and click callback reset to reset focus
    if (await this.menuIsExpanded()) {
      await this.sendKey(MenuComponentSelector.PrimaryComponent, Keys.ESCAPE);
      await (await this._callbackResetButton).click();
    }
  }

  getItemSelector(itemPosition: number) {
    return itemPosition as MenuComponentSelector;
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

  get _secondaryComponent() {
    return By(MENUITEM_TEST_COMPONENT);
  }

  get _tertiaryComponent() {
    return By(MENUITEM_DISABLED_COMPONENT);
  }

  get _quaternaryComponent() {
    return By(MENUITEM_NO_A11Y_LABEL_COMPONENT);
  }

  get _quinternaryComponent() {
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
