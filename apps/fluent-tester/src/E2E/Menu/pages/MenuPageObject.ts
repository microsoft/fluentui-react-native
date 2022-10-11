import {
  MENU_TESTPAGE,
  MENUTRIGGER_TEST_COMPONENT,
  MENUITEM_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_MENU_BUTTON,
  MENUITEM_TEST_COMPONENT,
  MENUPOPOVER_TEST_COMPONENT,
  MENU_DEFOCUS_BUTTON,
} from '../../../TestComponents/Menu/consts';
import { BasePage, By } from '../../common/BasePage';

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
    const expandCollapseState = await (await this._primaryComponent).getAttribute('ExpandCollapse.ExpandCollapseState');
    const menuItemIsDisplayed = await (await this._secondaryComponent).isDisplayed();
    return expandCollapseState === 'Expanded' && menuItemIsDisplayed;
  }

  async getMenuItemAccessibilityLabel(componentSelector: MenuComponentSelector): Promise<string> {
    switch (componentSelector) {
      case MenuComponentSelector.PrimaryComponent:
        return await this._primaryComponent.getAttribute('Name');

      case MenuComponentSelector.SecondaryComponent:
        return await this._secondaryComponent.getAttribute('Name');

      case MenuComponentSelector.TertiaryComponent:
        return await this._tertiaryComponent.getAttribute('Name');
    }
  }

  async getMenuAccessibilityRole(): Promise<string> {
    return await By(MENUPOPOVER_TEST_COMPONENT).getAttribute('ControlType');
  }

  async getMenuItemAccessibilityRole(): Promise<string> {
    return await this._secondaryComponent.getAttribute('ControlType');
  }

  /* Sends a Keyboarding command on a specific UI element */
  async sendKey(menuComponentSelector: MenuComponentSelector, key: string): Promise<void> {
    await (await this.getMenuComponentSelector(menuComponentSelector)).addValue(key);
  }

  /* Returns the correct WebDriverIO element from the Button Selector */
  async getMenuComponentSelector(menuComponentSelector?: MenuComponentSelector): Promise<WebdriverIO.Element> {
    if (menuComponentSelector == MenuComponentSelector.PrimaryComponent) {
      return await this._primaryComponent;
    }
    return await this._primaryComponent;
  }

  async resetTest() {
    await (await this._defocusButton).click();
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
