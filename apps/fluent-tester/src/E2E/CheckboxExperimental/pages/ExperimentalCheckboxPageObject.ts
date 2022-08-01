import {
  HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON,
  EXPERIMENTAL_CHECKBOX_TESTPAGE,
  EXPERIMENTAL_CHECKBOX_TEST_COMPONENT,
  EXPERIMENTAL_CHECKBOX_NO_A11Y_LABEL_COMPONENT,
  EXPERIMENTAL_CHECKBOX_ON_PRESS,
} from '../../../TestComponents/CheckboxExperimental/consts';
import { BasePage, By } from '../../common/BasePage.win';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The spec file should import this enum and use it when wanting to interact with different elements on the page. */
export const enum ExperimentalCheckboxSelector {
  Primary, //this._primaryComponent
}

class ExperimentalCheckboxPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  isCheckboxChecked(): boolean {
    return this._primaryComponent.isSelected();
  }

  waitForCheckboxChecked(timeout?: number): void {
    browser.waitUntil(
      () => {
        return this.isCheckboxChecked();
      },
      {
        timeout: timeout ?? this.waitForPageTimeout,
        timeoutMsg: 'The Checkbox was not toggled correctly',
        interval: 1000,
      },
    );
  }

  /* Useful in beforeEach() hook to reset the checkbox before every test */
  toggleCheckboxToUnchecked(): void {
    if (this.isCheckboxChecked()) {
      this._primaryComponent.click();
    }
  }

  didOnChangeCallbackFire(): boolean {
    const callbackText = By(EXPERIMENTAL_CHECKBOX_ON_PRESS);
    browser.waitUntil(
      () => {
        return callbackText.isDisplayed();
      },
      {
        timeout: this.waitForPageTimeout,
        timeoutMsg: 'The OnChange callback did not fire.',
        interval: 1000,
      },
    );

    return callbackText.isDisplayed();
  }

  /* Sends a Keyboarding command on a specific UI element */
  sendKey(selector: ExperimentalCheckboxSelector, key: string): void {
    this.getCheckboxSelector(selector).addValue(key);
  }

  /* Returns the correct WebDriverIO element from the Checkbox Selector */
  getCheckboxSelector(selector?: ExperimentalCheckboxSelector): WebdriverIO.Element {
    if (selector == ExperimentalCheckboxSelector.Primary) {
      return this._primaryComponent;
    }
    return this._primaryComponent;
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
