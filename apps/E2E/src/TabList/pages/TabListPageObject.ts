import { BasePage, By } from '../../common/BasePage';
import { Attribute, AttributeValue } from '../../common/consts';
import {
  TABLIST_TESTPAGE,
  HOMEPAGE_TABLIST_BUTTON,
  TABLIST_TEST_COMPONENT,
  TABLIST_NO_A11Y_LABEL_COMPONENT,
  FIRST_TAB,
  SECOND_TAB,
  THIRD_TAB,
  FOURTH_TAB,
  FIFTH_TAB,
  TABLIST_CALLBACK_TEXT,
} from '../consts';

type Tab = 'First' | 'Second' | 'Third' | 'Fourth' | 'Fifth';

class TabListPageObject extends BasePage {
  async resetRadioGroupSelection(): Promise<void> {
    return (await this.getTab('First')).click();
  }

  async isTabSelected(selector: Tab): Promise<boolean> {
    return await (await this.getTab(selector)).isSelected();
  }

  async isTabFocused(selector: Tab): Promise<boolean> {
    return await this.compareAttribute(this.getTab(selector), Attribute.IsFocused, AttributeValue.true);
  }

  async waitForTabSelected(selector: Tab, errorMsg: string, timeout?: number): Promise<boolean> {
    await this.waitForCondition(async () => await this.isTabSelected(selector), errorMsg, timeout);
    return await this.isTabSelected(selector);
  }

  async waitForTabFocused(selector: Tab, errorMsg: string, timeout?: number): Promise<boolean> {
    await this.waitForCondition(async () => await this.isTabFocused(selector), errorMsg, timeout);
    return await this.isTabFocused(selector);
  }

  async waitForCallbackToFire(tabKeyPressed: string, errorMsg: string, timeout?: number) {
    const callbackText = await By(TABLIST_CALLBACK_TEXT);
    await this.waitForCondition(async () => (await callbackText.getText()) === tabKeyPressed, errorMsg, timeout);
    return (await callbackText.getText()) === tabKeyPressed;
  }

  async getTab(selector: Tab): Promise<WebdriverIO.Element> {
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

  get _secondaryComponentName() {
    return TABLIST_NO_A11Y_LABEL_COMPONENT;
  }
}

export default new TabListPageObject();
