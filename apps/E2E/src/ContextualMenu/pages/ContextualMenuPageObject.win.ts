import { BasePage, By } from '../../common/BasePage';
import { Keys } from '../../common/consts';
import {
  CONTEXTUALMENU_TESTPAGE,
  CONTEXTUALMENU_TEST_COMPONENT,
  HOMEPAGE_CONTEXTUALMENU_BUTTON,
  CONTEXTUALMENUITEM_TEST_COMPONENT,
} from '../consts';

class ContextualMenuPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  /* Waits for the MenuItems to be displayed and returns true / false whether that occurs. */
  async waitForContextualMenuItemsToDisplay(timeout?: number): Promise<boolean | void> {
    return await this.waitForCondition(async () => await this.contextualMenuItemDisplayed(), 'The Contextual Menu Items did not display.', timeout);
  }

  /* Whether the contextual menu item is displayed or not. It should be displayed after clicking on the MenuButton */
  async contextualMenuItemDisplayed(): Promise<boolean> {
    return await (await this._contextualMenuItem).isDisplayed();
  }

  /* Closes the ContextualMenu by sending an ESCAPE key input to the menu button */
  async closeContextualMenu(): Promise<void> {
    if (await this.contextualMenuItemDisplayed()) {
      await this.sendKeys(this._contextualMenuItem, [Keys.ESCAPE]);
      await this.waitForCondition(
        async () => !(await this.contextualMenuItemDisplayed()),
        "Pressed 'ESC' on the ContextualMenu item, but the ContextualMenu items are still displayed - the ContextMenu appears to still be open.",
      );
    }
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return CONTEXTUALMENU_TESTPAGE;
  }

  get _contextualMenu(): ChainablePromiseElement {
    return By(CONTEXTUALMENU_TEST_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_CONTEXTUALMENU_BUTTON;
  }

  get _contextualMenuItem(): ChainablePromiseElement {
    return By(CONTEXTUALMENUITEM_TEST_COMPONENT);
  }
}

export default new ContextualMenuPageObject();
