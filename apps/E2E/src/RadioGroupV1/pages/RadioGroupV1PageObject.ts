import { BasePage, By } from '../../common/BasePage';
import { Attribute, AttributeValue } from '../../common/consts';
import {
  FIFTH_RADIO,
  FIRST_RADIO,
  FOURTH_RADIO,
  HOMEPAGE_RADIOGROUPV1_BUTTON,
  RADIOGROUPV1_NO_A11Y_LABEL_COMPONENT,
  RADIOGROUPV1_TESTPAGE,
  RADIOGROUPV1_TEST_COMPONENT,
  SECOND_RADIO,
  THIRD_RADIO,
} from '../consts';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The main RadioGroup we are testing has FOUR Radios. The spec file will
 * import this enum to easily write tests using these 4 radio buttons. */
type Radio =
  | 'First' // this._firstRadio
  | 'Second' // this._secondRadio
  | 'Third' // this._thirdRadio
  | 'Fourth' // this._fourthRadio
  | 'Fifth'; // this._fifthRadio

class RadioGroupV1Page extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/

  /* This resets the RadioGroup selection by clicking/selecting the 1st Radio in the RadioGroup.
   * Useful in beforeEach() hooks to reset the RadioGroup before additional tests */
  async resetRadioGroupSelection(): Promise<void> {
    await (await this.getRadio('First')).click();
  }

  async isRadioSelected(radioSelector: Radio): Promise<boolean> {
    return await (await this.getRadio(radioSelector)).isSelected();
  }

  async isRadioFocused(radioSelector: Radio): Promise<boolean> {
    return this.compareAttribute(this.getRadio(radioSelector), Attribute.IsFocused, AttributeValue.true);
  }

  async waitForRadioSelected(radioSelector: Radio, errorMsg: string, timeout?: number): Promise<boolean | void> {
    return await this.waitForCondition(async () => await this.isRadioSelected(radioSelector), errorMsg, timeout);
  }

  async waitForRadioFocused(radioSelector: Radio, errorMsg: string, timeout?: number): Promise<boolean | void> {
    return await this.waitForCondition(async () => await this.isRadioFocused(radioSelector), errorMsg, timeout);
  }

  /* Returns the correct WebDriverIO element from the Radio Selector */
  getRadio(radioSelector: Radio): Promise<WebdriverIO.Element> {
    switch (radioSelector) {
      case 'First':
        return By(FIRST_RADIO);
      case 'Second':
        return By(SECOND_RADIO);
      case 'Third':
        return By(THIRD_RADIO);
      case 'Fourth':
        return By(FOURTH_RADIO);
      case 'Fifth':
        return By(FIFTH_RADIO);
    }
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return RADIOGROUPV1_TESTPAGE;
  }

  get _primaryComponentName() {
    return RADIOGROUPV1_TEST_COMPONENT;
  }

  get _secondaryComponentName() {
    return RADIOGROUPV1_NO_A11Y_LABEL_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_RADIOGROUPV1_BUTTON;
  }
}

export default new RadioGroupV1Page();
