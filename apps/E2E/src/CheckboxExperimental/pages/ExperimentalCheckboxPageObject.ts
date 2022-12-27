import {
  HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON,
  EXPERIMENTAL_CHECKBOX_TESTPAGE,
  EXPERIMENTAL_CHECKBOX_TEST_COMPONENT,
  EXPERIMENTAL_CHECKBOX_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_CHECKBOX_ON_PRESS,
} from '../../../../fluent-tester/src/TestComponents/CheckboxExperimental/consts';
import { BasePage, By } from '../../common/BasePage';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The spec file should import this enum and use it when wanting to interact with different elements on the page. */
export const enum ExperimentalCheckboxSelector {
  Primary, //this._primaryComponent
}

class ExperimentalCheckboxPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async isCheckboxChecked(): Promise<boolean> {
    return await (await this._primaryComponent).isSelected();
  }

  async waitForCheckboxChecked(timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await this.isCheckboxChecked(), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg: 'The Checkbox was not toggled correctly',
      interval: 1000,
    });
  }

  /* Useful in beforeEach() hook to reset the checkbox before every test */
  async toggleCheckboxToUnchecked(): Promise<void> {
    if (await this.isCheckboxChecked()) {
      await (await this._primaryComponent).click();
    }
  }

  async didOnChangeCallbackFire(): Promise<boolean> {
    const callbackText = await By(EXPERIMENTAL_CHECKBOX_ON_PRESS);
    await browser.waitUntil(async () => await callbackText.isDisplayed(), {
      timeout: this.waitForUiEvent,
      timeoutMsg: 'The OnChange callback did not fire.',
      interval: 1000,
    });

    return await callbackText.isDisplayed();
  }

  /* Sends a Keyboarding command on a specific UI element */
  async sendKey(selector: ExperimentalCheckboxSelector, key: string): Promise<void> {
    await (await this.getCheckboxSelector(selector)).addValue(key);
  }

  /* Returns the correct WebDriverIO element from the Checkbox Selector */
  async getCheckboxSelector(selector?: ExperimentalCheckboxSelector): Promise<WebdriverIO.Element> {
    if (selector == ExperimentalCheckboxSelector.Primary) {
      return await this._primaryComponent;
    }
    return await this._primaryComponent;
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(EXPERIMENTAL_CHECKBOX_TESTPAGE);
  }

  get _pageName() {
    return EXPERIMENTAL_CHECKBOX_TESTPAGE;
  }

  get _primaryComponent() {
    return By(EXPERIMENTAL_CHECKBOX_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(EXPERIMENTAL_CHECKBOX_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON);
  }
}

export default new ExperimentalCheckboxPageObject();
