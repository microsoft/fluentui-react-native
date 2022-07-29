import {
  SWITCH_TESTPAGE,
  SWITCH_TEST_COMPONENT,
  HOMEPAGE_SWITCH_BUTTON,
  SWITCH_TOGGLE_OFF,
  SWITCH_TOGGLE_ON,
} from '../../../TestComponents/Switch/consts';
import { BasePage, By } from '../../common/BasePage.win';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The spec file should import this enum and use it when wanting to interact with different elements on the page. */
export const enum SwitchComponentSelector {
  PrimaryComponent, //this._primaryComponent
}

class SwitchPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  didToggleOn(): boolean {
    const callbackText = By(SWITCH_TOGGLE_ON);
    browser.waitUntil(
      () => {
        return callbackText.isDisplayed();
      },
      {
        timeout: this.waitForPageTimeout,
        timeoutMsg: 'The Switch did not toggle on.',
        interval: 1000,
      },
    );

    return callbackText.isDisplayed();
  }

  didToggleOff(): boolean {
    const callbackText = By(SWITCH_TOGGLE_OFF);
    browser.waitUntil(
      () => {
        return callbackText.isDisplayed();
      },
      {
        timeout: this.waitForPageTimeout,
        timeoutMsg: 'The Switch did not toggle off.',
        interval: 1000,
      },
    );

    return callbackText.isDisplayed();
  }

  /* Sends a Keyboarding command on a specific UI element */
  sendKey(switchSelector: SwitchComponentSelector, key: string): void {
    this.getButtonSelector(switchSelector).addValue(key);
  }

  /* Returns the correct WebDriverIO element from the Button Selector */
  getButtonSelector(switchSelector?: SwitchComponentSelector): WebdriverIO.Element {
    if (switchSelector == SwitchComponentSelector.PrimaryComponent) {
      return this._primaryComponent;
    }
    return this._primaryComponent;
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(SWITCH_TESTPAGE);
  }

  get _pageName() {
    return SWITCH_TESTPAGE;
  }

  get _primaryComponent() {
    return By(SWITCH_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_SWITCH_BUTTON);
  }
}

export default new SwitchPageObject();
