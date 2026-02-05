import { BasePage, By } from '../../common/BasePage';
import { Attribute, AttributeValue } from '../../common/consts';
import {
  TABLIST_TESTPAGE,
  HOMEPAGE_TABLIST_BUTTON,
  TABLIST_TEST_COMPONENT,
  FIRST_TAB,
  SECOND_TAB,
  THIRD_TAB,
  FOURTH_TAB,
  FIFTH_TAB,
  TABLIST_CALLBACK_TEXT,
} from '../consts';

type Tab = 'First' | 'Second' | 'Third' | 'Fourth' | 'Fifth';

class TabListPageObject extends BasePage {
  async resetListSelection(): Promise<void> {
    (await this.getTab('First')).click();
    await this.waitForTabSelected('First', 'Reset TabList, first tab should be selected');
  }

  // Waits for given tab's selection state to be true. Throws an error if the selection state is still false at the end of the timeout.
  async waitForTabSelected(selector: Tab, errorMsg: string, timeout?: number): Promise<void> {
    await this.waitForCondition(async () => await this.getTab(selector).isSelected(), errorMsg, timeout);
  }

  // Waits for given tab to be focused. Throws an error if the tab is not focused at the end of the timeout.
  async waitForTabFocused(selector: Tab, errorMsg: string, timeout?: number): Promise<void> {
    await this.waitForCondition(
      async () => await this.compareAttribute(this.getTab(selector), Attribute.IsFocused, AttributeValue.true),
      errorMsg,
      timeout,
    );
  }

  // Waits for the TabList's `onTabSelect` callback to fire (changing a text component value). Throws an error if the callback doesn't fire by the end of the timeout.
  async waitForCallbackToFire(tabKeyPressed: string, errorMsg: string, timeout?: number): Promise<void> {
    const callbackText = By(TABLIST_CALLBACK_TEXT);
    await this.waitForCondition(async () => (await callbackText.getText()) === tabKeyPressed, errorMsg, timeout);
  }

  getTab(selector: Tab) {
    switch (selector) {
      case 'First':
        return By(FIRST_TAB);
      case 'Second':
        return By(SECOND_TAB);
      case 'Third':
        return By(THIRD_TAB);
      case 'Fourth':
        return By(FOURTH_TAB);
      case 'Fifth':
        return By(FIFTH_TAB);
    }
  }

  /**
   * Getters
   */
  get _pageName(): string {
    return TABLIST_TESTPAGE;
  }

  get _pageButtonName(): string {
    return HOMEPAGE_TABLIST_BUTTON;
  }

  get _primaryComponentName() {
    return TABLIST_TEST_COMPONENT;
  }
}

export default new TabListPageObject();
