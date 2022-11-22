import {
  RADIO_GROUP_EXPERIMENTAL_TESTPAGE,
  RADIOGROUP_TEST_COMPONENT,
  RADIOGROUP_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_RADIO_GROUP_EXPERIMENTAL_BUTTON,
  FIRST_RADIO,
  SECOND_RADIO,
  THIRD_RADIO,
  FOURTH_RADIO,
  FIFTH_RADIO,
} from '../../../TestComponents/RadioGroupExperimental/consts';
import { BasePage, By } from '../../common/BasePage';
import { Attribute, AttributeValue } from '../../common/consts';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The main RadioGroup we are testing has FOUR Radios. The spec file will
 * import this enum to easily write tests using these 4 radio buttons. */
export const enum RadioSelector {
  First = 0, // this._firstRadio
  Second, // this._secondRadio
  Third, // this._thirdRadio
  Fourth, // this._fourthRadio
  Fifth, // this._fifthRadio
}

class RadioGroupExperimentalPage extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  // Get Radio's accessibilityLabel
  async getRBAccessibilityLabel(radioSelector: RadioSelector): Promise<string> {
    return await (await this.getRadio(radioSelector)).getAttribute('Name');
  }

  /* This resets the RadioGroup selection by clicking/selecting the 1st Radio in the RadioGroup.
   * Useful in beforeEach() hooks to reset the RadioGroup before additional tests */
  async resetRadioGroupSelection(): Promise<void> {
    await (await this._firstRadio).click();
  }

  async getRadioAccesibilityRole(): Promise<string> {
    return await (await this._firstRadio).getAttribute('ControlType');
  }

  async isRadioSelected(radioSelector: RadioSelector): Promise<boolean> {
    return await (await this.getRadio(radioSelector)).isSelected();
  }

  async isRadioFocused(radioSelector: RadioSelector): Promise<boolean> {
    return (await this.getElementAttribute(await this.getRadio(radioSelector), Attribute.IsFocused)) == AttributeValue.true;
  }

  async clickRadio(radioSelector: RadioSelector): Promise<void> {
    await (await this.getRadio(radioSelector)).click();
  }

  async waitForRadioSelected(radioSelector: RadioSelector, timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await this.isRadioSelected(radioSelector), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg: 'Radio was not selected correctly.',
      interval: 1000,
    });
  }

  async waitForRadioFocused(radioSelector: RadioSelector, timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await this.isRadioFocused(radioSelector), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg: 'Radio was not focused correctly.',
      interval: 1000,
    });
  }

  /* Sends a Keyboarding command on a specific UI element */
  async sendKey(key: string, radioSelector: RadioSelector): Promise<void> {
    await (await this.getRadio(radioSelector)).addValue(key);
  }

  /* Returns the correct WebDriverIO element from the Radio Selector */
  async getRadio(radioSelector: RadioSelector): Promise<WebdriverIO.Element> {
    if (radioSelector == RadioSelector.First) {
      return await this._firstRadio;
    } else if (radioSelector == RadioSelector.Second) {
      return await this._secondRadio;
    } else if (radioSelector == RadioSelector.Third) {
      return await this._thirdRadio;
    } else if (radioSelector == RadioSelector.Fourth) {
      return await this._fourthRadio;
    } else {
      return await this._fifthRadio;
    }
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(RADIO_GROUP_EXPERIMENTAL_TESTPAGE);
  }

  get _pageName() {
    return RADIO_GROUP_EXPERIMENTAL_TESTPAGE;
  }

  get _primaryComponent() {
    return By(RADIOGROUP_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(RADIOGROUP_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_RADIO_GROUP_EXPERIMENTAL_BUTTON);
  }

  /***************/
  /* Radio *
  /**************/

  /* The first RadioGroup has 4 radio buttons, all listed below */
  get _firstRadio() {
    return By(FIRST_RADIO);
  }

  get _secondRadio() {
    return By(SECOND_RADIO);
  }

  get _thirdRadio() {
    return By(THIRD_RADIO);
  }

  get _fourthRadio() {
    return By(FOURTH_RADIO);
  }

  get _fifthRadio() {
    return By(FIFTH_RADIO);
  }
}

export default new RadioGroupExperimentalPage();
