import {
  RADIOGROUPV1_TESTPAGE,
  RADIOGROUPV1_TEST_COMPONENT,
  RADIOGROUPV1_NO_A11Y_LABEL_COMPONENT,
  HOMEPAGE_RADIOGROUPV1_BUTTON,
  FIRST_RADIO,
  SECOND_RADIO,
  THIRD_RADIO,
  FOURTH_RADIO,
  FIFTH_RADIO,
} from '../consts';
import { BasePage, By } from '../../common/BasePage';
import { Attribute, AttributeValue } from '../../common/consts';

/* This enum gives the spec file an EASY way to interact with SPECIFIC UI elements on the page.
 * The main RadioGroup we are testing has FOUR Radios. The spec file will
 * import this enum to easily write tests using these 4 radio buttons. */
export const enum RadioSelector {
  First = 1, // this._firstRadio
  Second, // this._secondRadio
  Third, // this._thirdRadio
  Fourth, // this._fourthRadio
  Fifth, // this._fifthRadio
}

class RadioGroupV1Page extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/

  /* This resets the RadioGroup selection by clicking/selecting the 1st Radio in the RadioGroup.
   * Useful in beforeEach() hooks to reset the RadioGroup before additional tests */
  async resetRadioGroupSelection(): Promise<void> {
    await (await this.getRadio(RadioSelector.First)).click();
  }

  async isRadioSelected(radioSelector: RadioSelector): Promise<boolean> {
    return await (await this.getRadio(radioSelector)).isSelected();
  }

  async isRadioFocused(radioSelector: RadioSelector): Promise<boolean> {
    return this.compareAttribute(this.getRadio(radioSelector), Attribute.IsFocused, AttributeValue.true);
  }

  async waitForRadioSelected(radioSelector: RadioSelector, errorMsg?: string, timeout?: number): Promise<boolean> {
    await this.waitForCondition(
      async () => await this.isRadioSelected(radioSelector),
      errorMsg ?? `RadioButton #${radioSelector} failed to be selected before the timeout.`,
      timeout,
    );
    return await this.isRadioSelected(radioSelector);
  }

  async waitForRadioFocused(radioSelector: RadioSelector, errorMsg?: string, timeout?: number): Promise<boolean> {
    await this.waitForCondition(
      async () => await this.isRadioFocused(radioSelector),
      errorMsg ?? `RadioButton #${radioSelector} failed to be focused before the timeout.`,
      timeout,
    );
    return await this.isRadioFocused(radioSelector);
  }

  /* Returns the correct WebDriverIO element from the Radio Selector */
  async getRadio(radioSelector: RadioSelector): Promise<WebdriverIO.Element> {
    switch (radioSelector) {
      case RadioSelector.First:
        return By(FIRST_RADIO);
      case RadioSelector.Second:
        return By(SECOND_RADIO);
      case RadioSelector.Third:
        return By(THIRD_RADIO);
      case RadioSelector.Fourth:
        return By(FOURTH_RADIO);
      case RadioSelector.Fifth:
        return By(FIFTH_RADIO);
    }
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(RADIOGROUPV1_TESTPAGE);
  }

  get _pageName() {
    return RADIOGROUPV1_TESTPAGE;
  }

  get _primaryComponent() {
    return By(RADIOGROUPV1_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(RADIOGROUPV1_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_RADIOGROUPV1_BUTTON);
  }
}

export default new RadioGroupV1Page();
