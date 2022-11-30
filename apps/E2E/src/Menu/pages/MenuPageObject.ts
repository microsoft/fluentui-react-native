import {
  MENU_TESTPAGE,
  MENUTRIGGER_TEST_COMPONENT,
  MENUITEM_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_MENU_BUTTON,
  MENUITEM_TEST_COMPONENT,
  MENUPOPOVER_TEST_COMPONENT,
  MENU_DEFOCUS_BUTTON,
} from '../../../../fluent-tester/src/TestComponents/Menu/consts';
import { BasePage, By } from '../../common/BasePage';
import { Keys, ExpandCollapseState, Attribute } from '../../common/consts';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The spec file should import this enum and use it when wanting to interact with different elements on the page. */
export const enum MenuComponentSelector {
  PrimaryComponent, //this._primaryComponent
  SecondaryComponent, //this._secondaryComponent
  TertiaryComponent, //this._tertiaryComponent
}

class MenuPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async didMenuOpen(): Promise<boolean> {
    await browser.waitUntil(async () => await this.menuIsExpanded(), {
      timeout: this.waitForUiEvent,
      timeoutMsg: 'The Menu did not open.',
      interval: 1000,
    });

    return await this.menuIsExpanded();
  }

  async menuIsExpanded(): Promise<boolean> {
    return await (await this._secondaryComponent).isDisplayed();
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

  /* Returns the correct WebDriverIO element from the Button Selector */
  async getMenuComponentSelector(menuComponentSelector?: MenuComponentSelector): Promise<WebdriverIO.Element> {
    switch (menuComponentSelector) {
      case MenuComponentSelector.SecondaryComponent:
        return await this._secondaryComponent;
      case MenuComponentSelector.TertiaryComponent:
        return await this._tertiaryComponent;
      default:
        return await this._primaryComponent;
    }
  }

  async resetTest() {
    // Both escape on the menu trigger to hard dismiss menu and click defocus to reset focus
    if (await this.menuIsExpanded()) {
      await this.sendKey(MenuComponentSelector.PrimaryComponent, Keys.ESCAPE);
      await (await this._defocusButton).click();
    }
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
    return By(MENUITEM_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_MENU_BUTTON);
  }

  get _defocusButton() {
    return By(MENU_DEFOCUS_BUTTON);
  }
}

export default new MenuPageObject();
