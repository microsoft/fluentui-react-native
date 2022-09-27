import {
  BUTTON_TESTPAGE,
  BUTTON_TEST_COMPONENT,
  BUTTON_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_BUTTON_BUTTON,
  BUTTON_ON_PRESS,
} from '../../../TestComponents/Button/consts';
import { BasePage, GetElement } from '../../common/BasePage';
import { Keys } from '../../common/consts';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The spec file should import this enum and use it when wanting to interact with different elements on the page. */
export const enum ButtonSelector {
  PrimaryButton, //this._primaryComponent
}
class ButtonExperimentalPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async didOnClickCallbackFire(): Promise<boolean> {
    const callbackText = await GetElement(BUTTON_ON_PRESS);
    await browser.waitUntil(async () => await callbackText.isDisplayed(), {
      timeout: this.waitForUIEvent,
      timeoutMsg: 'The OnClick callback did not fire.',
      interval: 1000,
    });

    return await callbackText.isDisplayed();
  }

  // This is a special case. Currently, the Button spec and the ButtonExperimental spec examples are both on
  // the same test page. We need to refresh the app so we cab re-navigate + re-scroll to the Button
  // Experimental component. Once the deprecated button is fully deprecated and we can remove that spec file,
  // we can rid of this function.
  async refreshButtonPage(): Promise<void> {
    const FocusButton = await GetElement('Focus_Button');
    await FocusButton.addValue(Keys.F5);
  }

  /* Sends a Keyboarding command on a specific UI element */
  async sendKey(buttonSelector: ButtonSelector, key: string): Promise<void> {
    await (await this.getButtonSelector(buttonSelector)).addValue(key);
  }

  /* Returns the correct WebDriverIO element from the Button Selector */
  async getButtonSelector(buttonSelector?: ButtonSelector): Promise<WebdriverIO.Element> {
    if (buttonSelector == ButtonSelector.PrimaryButton) {
      return await this._primaryComponent;
    }
    return await this._primaryComponent;
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(BUTTON_TESTPAGE);
  }

  get _pageName() {
    return BUTTON_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(BUTTON_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return GetElement(BUTTON_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_BUTTON_BUTTON);
  }
}

export default new ButtonExperimentalPageObject();
