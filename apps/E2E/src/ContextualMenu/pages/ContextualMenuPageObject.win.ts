import {
  CONTEXTUALMENU_TESTPAGE,
  CONTEXTUALMENU_TEST_COMPONENT,
  HOMEPAGE_CONTEXTUALMENU_BUTTON,
  CONTEXTUALMENUITEM_TEST_COMPONENT,
} from '../../../../fluent-tester/src/TestComponents/ContextualMenu/consts';
import { BasePage, By } from '../../common/BasePage';

class ContextualMenuPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async waitForContextualMenuItemsToOpen(timeout?: number): Promise<void> {
    await this.waitForCondition(async () => this.contextualMenuItemDisplayed(), 'The Contextual Menu Items did not open.', timeout);
  }

  /* Whether the contextual menu item is displayed or not. It should be displayed after clicking on the MenuButton */
  async contextualMenuItemDisplayed(): Promise<boolean> {
    return await (await this._contextualMenuItem).isDisplayed();
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

  get _contextualMenu() {
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
