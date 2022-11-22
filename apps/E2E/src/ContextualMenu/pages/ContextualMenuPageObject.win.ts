import {
  CONTEXTUALMENU_TESTPAGE,
  CONTEXTUALMENU_TEST_COMPONENT,
  HOMEPAGE_CONTEXTUALMENU_BUTTON,
  CONTEXTUALMENUITEM_TEST_COMPONENT,
} from '../../../../fluent-tester/src/TestComponents/ContextualMenu/consts';
import { BasePage, By } from '../../common/BasePage';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The spec file should import this enum and use it when wanting to interact with different elements on the page. */
export const enum ContextualMenuSelector {
  ContextualMenu = 0, //this._primaryComponent
  ContextualMenuItem, //this._contextualMenuItem
}

class ContextualMenuPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async waitForContextualMenuItemsToOpen(timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await this.contextualMenuItemDisplayed(), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg: 'The Contextual Menu Items did not open.',
      interval: 1000,
    });
  }

  /* Whether the contextual menu item is displayed or not. It should be displayed after clicking on the MenuButton */
  async contextualMenuItemDisplayed(): Promise<boolean> {
    return await (await this._contextualMenuItem).isDisplayed();
  }

  /* Sends a Keyboarding command on a specific UI element */
  async sendKey(contextualMenuSelector: ContextualMenuSelector, key: string): Promise<void> {
    await (await this.getContextualMenuSelector(contextualMenuSelector)).addValue(key);
  }

  /* Returns the correct WebDriverIO element from the ContextualMenuSelector string */
  async getContextualMenuSelector(contextualMenuSelector?: ContextualMenuSelector): Promise<WebdriverIO.Element> {
    if (contextualMenuSelector == ContextualMenuSelector.ContextualMenu) {
      return await this._primaryComponent;
    } else if (contextualMenuSelector == ContextualMenuSelector.ContextualMenuItem) {
      return await this._contextualMenuItem;
    } else {
      return await this._primaryComponent;
    }
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(CONTEXTUALMENU_TESTPAGE);
  }

  get _pageName() {
    return CONTEXTUALMENU_TESTPAGE;
  }

  get _primaryComponent() {
    return By(CONTEXTUALMENU_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_CONTEXTUALMENU_BUTTON);
  }

  get _contextualMenuItem() {
    return By(CONTEXTUALMENUITEM_TEST_COMPONENT);
  }
}

export default new ContextualMenuPageObject();
