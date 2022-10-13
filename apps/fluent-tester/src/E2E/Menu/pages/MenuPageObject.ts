import {
  MENU_TESTPAGE,
  MENUTRIGGER_TEST_COMPONENT,
  MENUITEM_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_MENU_BUTTON,
  MENU_ON_OPEN,
  MENU_ON_CLOSE,
  MENUITEM_TEST_COMPONENT,
  MENUPOPOVER_TEST_COMPONENT,
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
    const callbackText = await By(MENU_ON_OPEN);
    await browser.waitUntil(async () => await callbackText.isDisplayed(), {
      timeout: this.waitForUiEvent,
      timeoutMsg: 'The Menu did not open.',
      interval: 1000,
    });

    return await callbackText.isDisplayed();
  }

  async didMenuClose(): Promise<boolean> {
    const callbackText = await By(MENU_ON_CLOSE);
    await browser.waitUntil(async () => await callbackText.isDisplayed(), {
      timeout: this.waitForUiEvent,
      timeoutMsg: 'The Menu did not close.',
      interval: 1000,
    });

    return await callbackText.isDisplayed();
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
}

export default new MenuPageObject();
