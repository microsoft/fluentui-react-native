import { BasePage, By } from '../../common/BasePage';
import {
  FIRST_RADIO_BUTTON,
  FOURTH_RADIO_BUTTON,
  HOMEPAGE_RADIOGROUP_BUTTON,
  RADIOGROUP_NO_A11Y_LABEL_COMPONENT,
  RADIOGROUP_TESTPAGE,
  RADIOGROUP_TEST_COMPONENT,
  SECOND_RADIO_BUTTON,
  THIRD_RADIO_BUTTON,
} from '../consts';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The main RadioGroup we are testing has FOUR RadioButtons. The spec file will
 * import this enum to easily write tests using these 4 radio buttons. */
type RadioButton =
  | 'First' // this._firstRadioButton
  | 'Second' // this._secondRadioButton
  | 'Third' // this._thirdRadioButton
  | 'Fourth'; // this._fourthRadioButton

class RadioGroupLegacyPage extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/

  /* This resets the RadioGroup selection by clicking/selecting the 1st RadioButton in the RadioGroup.
   * Useful in beforeEach() hooks to reset the RadioGroup before additional tests */
  async resetRadioGroupSelection(): Promise<void> {
    await (await this.getRadioButton('First')).click();
  }

  async isRadioButtonSelected(selector: RadioButton): Promise<boolean> {
    return await (await this.getRadioButton(selector)).isSelected();
  }

  async waitForRadioButtonSelected(selector: RadioButton, errorMsg: string): Promise<boolean | void> {
    return await this.waitForCondition(async () => await this.isRadioButtonSelected(selector), errorMsg);
  }

  /* Returns the correct WebDriverIO element from the RadioButton Selector */
  getRadioButton(selector: RadioButton) {
    switch (selector) {
      case 'First':
        return By(FIRST_RADIO_BUTTON);
      case 'Second':
        return By(SECOND_RADIO_BUTTON);
      case 'Third':
        return By(THIRD_RADIO_BUTTON);
      case 'Fourth':
        return By(FOURTH_RADIO_BUTTON);
    }
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return RADIOGROUP_TESTPAGE;
  }

  get _firstRadioGroup() {
    return By(RADIOGROUP_TEST_COMPONENT);
  }

  get _secondRadioGroup() {
    return By(RADIOGROUP_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_RADIOGROUP_BUTTON;
  }
}

export default new RadioGroupLegacyPage();
