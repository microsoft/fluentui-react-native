import {
  EXPERIMENTAL_LINK_CALLBACK_TEXT,
  EXPERIMENTAL_LINK_CALLBACK_VALUE,
  EXPERIMENTAL_LINK_DISABLED_COMPONENT,
  EXPERIMENTAL_LINK_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_LINK_RESET_BUTTON,
  EXPERIMENTAL_LINK_TESTPAGE,
  EXPERIMENTAL_LINK_TEST_COMPONENT,
  HOMEPAGE_EXPERIMENTAL_LINK_BUTTON,
} from '../../../TestComponents/LinkExperimental/consts';
import { BasePage, By } from '../../common/BasePage';
import { Keys } from '../../common/consts';

export const enum ExperimentalLinkSelector {
  First = 0,
  Second,
  Third,
}
class ExperimentalLinkPageObject extends BasePage {
  async click(selector: ExperimentalLinkSelector) {
    await (await this.getComponent(selector)).click();
  }

  async sendKeys(selector: ExperimentalLinkSelector, keys: Keys[]) {
    await (await this.getComponent(selector)).addValue(keys);
  }

  async getComponent(selector: ExperimentalLinkSelector) {
    switch (selector) {
      case ExperimentalLinkSelector.First:
        return await this._primaryComponent;
      case ExperimentalLinkSelector.Second:
        return await this._secondaryComponent;
      case ExperimentalLinkSelector.Third:
        return await this._tertiaryComponent;
    }
  }

  async callbackDidFire() {
    await browser.waitUntil(
      async () => {
        return (await (await this._callbackText).getText()) === EXPERIMENTAL_LINK_CALLBACK_VALUE;
      },
      {
        timeout: this.waitForUiEvent,
        timeoutMsg: 'Experimental link callback did not fire.',
      },
    );
    return (await (await this._callbackText).getText()) === EXPERIMENTAL_LINK_CALLBACK_VALUE;
  }

  async resetCallback() {
    await (await this._resetButton).click();
    await browser.waitUntil(
      async () => {
        return (await (await this._callbackText).getText()) === '';
      },
      {
        timeout: this.waitForUiEvent,
        timeoutMsg: 'Experimental link callback did not reset.',
      },
    );
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(EXPERIMENTAL_LINK_TESTPAGE);
  }

  get _pageName() {
    return EXPERIMENTAL_LINK_TESTPAGE;
  }

  get _primaryComponent() {
    return By(EXPERIMENTAL_LINK_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(EXPERIMENTAL_LINK_NO_A11Y_LABEL_COMPONENT);
  }

  get _tertiaryComponent() {
    return By(EXPERIMENTAL_LINK_DISABLED_COMPONENT);
  }

  get _resetButton() {
    return By(EXPERIMENTAL_LINK_RESET_BUTTON);
  }

  get _callbackText() {
    return By(EXPERIMENTAL_LINK_CALLBACK_TEXT);
  }

  get _pageButton() {
    return By(HOMEPAGE_EXPERIMENTAL_LINK_BUTTON);
  }
}

export default new ExperimentalLinkPageObject();
