import { BasePage, By } from '../../common/BasePage';
import {
  HOMEPAGE_OVERFLOW_BUTTON,
  OVERFLOW_TESTPAGE,
  OVERFLOW_TEST_COMPONENT,
  FIRST_OVERFLOW_ITEM,
  SECOND_OVERFLOW_ITEM,
  THIRD_OVERFLOW_ITEM,
  OVERFLOW_MENU,
  READY_LABEL,
  READY_VALUE_TRUE,
  UPDATED_LABEL,
  UPDATED_VALUE_TRUE,
  RADIO_175,
  RADIO_275,
  RADIO_375,
} from '../consts';

type OverflowItem = 'First' | 'Second' | 'Third';
type OverflowWidth = 175 | 275 | 375;

class OverflowPageObject extends BasePage {
  async waitForOverflowToBeReady() {
    const readyLabel = await By(READY_LABEL);
    await this.waitForCondition(async () => (await readyLabel.getText()) === READY_VALUE_TRUE);
  }

  async waitForOverflowToBeUpdated() {
    const updatedLabel = await By(UPDATED_LABEL);
    await this.waitForCondition(async () => (await updatedLabel.getText()) === UPDATED_VALUE_TRUE);
  }

  getOverflowItem(selector: OverflowItem) {
    switch (selector) {
      case 'First':
        return By(FIRST_OVERFLOW_ITEM);
      case 'Second':
        return By(SECOND_OVERFLOW_ITEM);
      case 'Third':
        return By(THIRD_OVERFLOW_ITEM);
    }
  }

  async itemIsVisible(selector: OverflowItem, errorMsg?: string) {
    const item = this.getOverflowItem(selector);
    return item.waitForDisplayed({ timeoutMsg: errorMsg });
  }

  async menuIsDisplayed(errorMsg?: string) {
    return this._overflowMenu.waitForDisplayed({ timeoutMsg: errorMsg });
  }

  async setOverflowWidth(width: OverflowWidth) {
    let selector: string;
    switch (width) {
      case 175:
        selector = RADIO_175;
        break;
      case 275:
        selector = RADIO_275;
        break;
      case 375:
        selector = RADIO_375;
        break;
    }
    const radio = By(selector);
    await radio.click();
    await this.waitForOverflowToBeUpdated();
  }

  async menuHasNHidden(n: number) {
    const menu = this._overflowMenu;
    const text = await menu.getText();
    console.log('TEXT:', text);
    return text.includes(n.toString());
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _overflowMenu() {
    return By(OVERFLOW_MENU);
  }

  get _readyLabel() {
    return By(READY_LABEL);
  }

  get _updatedLabel() {
    return By(UPDATED_LABEL);
  }

  get _pageButtonName() {
    return HOMEPAGE_OVERFLOW_BUTTON;
  }

  get _pageName() {
    return OVERFLOW_TESTPAGE;
  }

  get _primaryComponentName() {
    return OVERFLOW_TEST_COMPONENT;
  }
}

export default new OverflowPageObject();
