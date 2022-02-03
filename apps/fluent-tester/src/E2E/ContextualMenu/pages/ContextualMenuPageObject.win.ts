import {
  CONTEXTUALMENU_TESTPAGE,
  CONTEXTUALMENU_TEST_COMPONENT,
  HOMEPAGE_CONTEXTUALMENU_BUTTON,
  CONTEXTUALMENUITEM_TEST_COMPONENT,
} from '../../../FluentTester/TestComponents/ContextualMenu/consts';
import { BasePage, By } from '../../common/BasePage.win';

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
  waitForContextualMenuItemsToOpen(timeout?: number): void {
    browser.waitUntil(
      () => {
        return this.contextualMenuItemDisplayed();
      },
      {
        timeout: timeout ?? this.waitForPageTimeout,
        timeoutMsg: 'The Contextual Menu Items did not open.',
        interval: 1000,
      },
    );
  }

  /* Whether the contextual menu item is displayed or not. It should be displayed after clicking on the MenuButton */
  contextualMenuItemDisplayed(): boolean {
    return this._contextualMenuItem.isDisplayed();
  }

  /* Sends a Keyboarding command on a specific UI element */
  sendKey(contextualMenuSelector: ContextualMenuSelector, key: string): void {
    this.getContextualMenuSelector(contextualMenuSelector).addValue(key);
  }

  /* Returns the correct WebDriverIO element from the ContextualMenuSelector string */
  getContextualMenuSelector(contextualMenuSelector?: ContextualMenuSelector): WebdriverIO.Element {
    if (contextualMenuSelector == ContextualMenuSelector.ContextualMenu) {
      return this._primaryComponent;
    } else if (contextualMenuSelector == ContextualMenuSelector.ContextualMenuItem) {
      return this._contextualMenuItem;
    } else {
      return this._primaryComponent;
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
