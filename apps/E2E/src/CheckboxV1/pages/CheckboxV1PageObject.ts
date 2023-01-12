import {
  HOMEPAGE_CHECKBOXV1_BUTTON,
  CHECKBOXV1_TESTPAGE,
  CHECKBOXV1_TEST_COMPONENT,
  CHECKBOXV1_NO_A11Y_LABEL_COMPONENT,
  CHECKBOXV1_ON_PRESS,
} from '../consts';
import { BasePage, By, ComponentSelector } from '../../common/BasePage';

class CheckboxV1PageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async isCheckboxChecked(): Promise<boolean> {
    return await (await this._primaryComponent).isSelected();
  }

  async isCheckboxCheckedAndroid(): Promise<boolean> {
    return (await (await this._primaryComponent).getAttribute('checked')) === 'true';
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
    const callbackText = await By(CHECKBOXV1_ON_PRESS);
    await browser.waitUntil(async () => await callbackText.isDisplayed(), {
      timeout: this.waitForUiEvent,
      timeoutMsg: 'The OnChange callback did not fire.',
      interval: 1000,
    });

    return await callbackText.isDisplayed();
  }

  /* Sends a Keyboarding command on a specific UI element */
  async sendKey(selector: ComponentSelector, key: string): Promise<void> {
    await (await this.getCheckboxSelector(selector)).addValue(key);
  }

  /* Returns the correct WebDriverIO element from the Checkbox Selector */
  async getCheckboxSelector(selector?: ComponentSelector): Promise<WebdriverIO.Element> {
    if (selector == ComponentSelector.Primary) {
      return await this._primaryComponent;
    }
    return await this._secondaryComponent;
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(CHECKBOXV1_TESTPAGE);
  }

  get _pageName() {
    return CHECKBOXV1_TESTPAGE;
  }

  get _primaryComponentName() {
    return CHECKBOXV1_TEST_COMPONENT;
  }

  get _secondaryComponentName() {
    return CHECKBOXV1_NO_A11Y_LABEL_COMPONENT;
  }

  get _pageButton() {
    return By(HOMEPAGE_CHECKBOXV1_BUTTON);
  }

  get _pageButtonName() {
    return HOMEPAGE_CHECKBOXV1_BUTTON;
  }
}

export default new CheckboxV1PageObject();
