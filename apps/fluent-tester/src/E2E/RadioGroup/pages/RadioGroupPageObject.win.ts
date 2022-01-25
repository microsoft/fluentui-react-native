import {
  RADIOGROUP_TESTPAGE,
  RADIOGROUP_TEST_COMPONENT,
  RADIOGROUP_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_RADIOGROUP_BUTTON,
  FIRST_RADIO_BUTTON,
  SECOND_RADIO_BUTTON,
  THIRD_RADIO_BUTTON,
  FOURTH_RADIO_BUTTON,
} from '../../../FluentTester/TestComponents/RadioGroup/consts';
import { BasePage, By } from '../../common/BasePage.win';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The main RadioGroup we are testing has FOUR RadioButtons. The spec file will
 * import this enum to easily write tests using these 4 radio buttons. */
export const enum RadioButtonSelector {
  First = 0, // this._firstRadioButton
  Second, // this._secondRadioButton
  Third, // this._thirdRadioButton
  Fourth, // this._fourthRadioButton
}

class RadioGroupPage extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  // Get RadioButton's accessibilityLabel
  getRBAccessibilityLabel(radioButtonSelector: RadioButtonSelector): string {
    return this.getRadioButton(radioButtonSelector).getAttribute('Name');
  }

  /* This resets the RadioGroup selection by clicking/selecting the 1st RadioButton in the RadioGroup.
   * Useful in beforeEach() hooks to reset the RadioGroup before additional tests */
  resetRadioGroupSelection(): void {
    this._firstRadioButton.click();
  }

  getRadioButtonAccesibilityRole(): string {
    return this._firstRadioButton.getAttribute('ControlType');
  }

  isRadioButtonSelected(radioButtonSelector: RadioButtonSelector): boolean {
    return this.getRadioButton(radioButtonSelector).isSelected();
  }

  clickRadioButton(radioButtonSelector: RadioButtonSelector): void {
    this.getRadioButton(radioButtonSelector).click();
  }

  waitForRadioButtonSelected(radioButtonSelector: RadioButtonSelector, timeout?: number): void {
    browser.waitUntil(
      () => {
        return this.isRadioButtonSelected(radioButtonSelector);
      },
      {
        timeout: timeout ?? this.waitForPageTimeout,
        timeoutMsg: 'RadioButton was not selected correctly.',
        interval: 1000,
      },
    );
  }

  /* Sends a Keyboarding command on a specific UI element */
  sendKey(key?: string, radioButtonSelector?: RadioButtonSelector): void {
    this.getRadioButton(radioButtonSelector).addValue(key);
  }

  /* Returns the correct WebDriverIO element from the RadioButton Selector */
  getRadioButton(radioButtonSelector: RadioButtonSelector): WebdriverIO.Element {
    if (radioButtonSelector == RadioButtonSelector.First) {
      return this._firstRadioButton;
    } else if (radioButtonSelector == RadioButtonSelector.Second) {
      return this._secondRadioButton;
    } else if (radioButtonSelector == RadioButtonSelector.Third) {
      return this._thirdRadioButton;
    } else {
      return this._fourthRadioButton;
    }
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(RADIOGROUP_TESTPAGE);
  }

  get _pageName() {
    return RADIOGROUP_TESTPAGE;
  }

  get _primaryComponent() {
    return By(RADIOGROUP_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(RADIOGROUP_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_RADIOGROUP_BUTTON);
  }

  /***************/
  /* RadioButton *
  /**************/

  /* The first RadioGroup has 4 radio buttons, all listed below */
  get _firstRadioButton() {
    return By(FIRST_RADIO_BUTTON);
  }

  get _secondRadioButton() {
    return By(SECOND_RADIO_BUTTON);
  }

  get _thirdRadioButton() {
    return By(THIRD_RADIO_BUTTON);
  }

  get _fourthRadioButton() {
    return By(FOURTH_RADIO_BUTTON);
  }
}

export default new RadioGroupPage();
