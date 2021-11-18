import {
  RADIOGROUP_TESTPAGE,
  RADIOGROUP_TEST_COMPONENT,
  RADIOGROUP_NO_A11Y_LABEL_COMPONENT,
  RADIOBUTTON_TEST_COMPONENT,
  HOMEPAGE_RADIOGROUP_BUTTON,
  RADIOBUTTON_NO_A11Y_LABEL_COMPONENT,
} from '../../../FluentTester/TestComponents/RadioGroup/consts';
import { BasePage, By } from '../../common/BasePage';

export const enum RadioButtonSelector {
  Primary = 0, // this._primaryComponent
  Secondary, // this._secondaryComponent
}

class RadioGroupPage extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  // Get RadioButton's accessibilityLabel
  getRBAccessibilityLabel(radioButtonSelector: RadioButtonSelector): string {
    switch (radioButtonSelector) {
      case RadioButtonSelector.Primary:
        return this._radioButton.getAttribute('Name');

      case RadioButtonSelector.Secondary:
        return this._secondRadioButton.getAttribute('Name');
    }
  }

  getRadioButtonAccesibilityRole(): string {
    return this._radioButton.getAttribute('ControlType');
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
  get _radioButton() {
    return By(RADIOBUTTON_TEST_COMPONENT);
  }

  get _secondRadioButton() {
    return By(RADIOBUTTON_NO_A11Y_LABEL_COMPONENT);
  }
}

export default new RadioGroupPage();
