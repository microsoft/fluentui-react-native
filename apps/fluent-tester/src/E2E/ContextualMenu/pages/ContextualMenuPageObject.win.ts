import {
  CONTEXTUALMENU_TESTPAGE,
  CONTEXTUALMENU_TEST_COMPONENT,
  HOMEPAGE_CONTEXTUALMENU_BUTTON,
  CONTEXTUALMENUITEM_TEST_COMPONENT,
} from '../../../FluentTester/TestComponents/ContextualMenu/consts';
import { BasePage, By } from '../../common/BasePage.win';

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
