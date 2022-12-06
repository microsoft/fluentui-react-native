import { Attribute } from '../../common/consts';
import {
  TEXT_TESTPAGE,
  FIRST_TEXT_COMPONENT,
  HOMEPAGE_TEXT_BUTTON,
  SECOND_TEXT_COMPONENT,
  THIRD_TEXT_COMPONENT,
  FOURTH_TEXT_COMPONENT,
} from '../../../../fluent-tester/src/TestComponents/Text/consts';
import { BasePage, By } from '../../common/BasePage';

export const enum TextComponentSelector {
  First = 0, // this._firstComponent
  Second, // this._secondComponent
  Third, // this._thirdComponent
  Fourth, // this._fourthComponent
}

class TextPageObject extends BasePage {
  /* Gets the accessibility role of an UI element given the selector */
  async getTextAccessibilityRole(componentSelector: TextComponentSelector): Promise<string> {
    switch (componentSelector) {
      case TextComponentSelector.First:
        return await this.getElementAttribute(await this._firstComponent, Attribute.AccessibilityRole);

      case TextComponentSelector.Second:
        return await this.getElementAttribute(await this._secondComponent, Attribute.AccessibilityRole);

      case TextComponentSelector.Third:
        return await this.getElementAttribute(await this._thirdComponent, Attribute.AccessibilityRole);

      case TextComponentSelector.Fourth:
        return await this.getElementAttribute(await this._fourthComponent, Attribute.AccessibilityRole);
    }
  }

  /* Gets the accessibility label of an UI element given the selector */
  async getTextAccessibilityLabel(componentSelector: TextComponentSelector): Promise<string> {
    switch (componentSelector) {
      case TextComponentSelector.First:
        return await this.getElementAttribute(await this._firstComponent, Attribute.AccessibilityLabel);

      case TextComponentSelector.Second:
        return await this.getElementAttribute(await this._secondComponent, Attribute.AccessibilityLabel);

      case TextComponentSelector.Third:
        return await this.getElementAttribute(await this._thirdComponent, Attribute.AccessibilityLabel);

      case TextComponentSelector.Fourth:
        return await this.getElementAttribute(await this._fourthComponent, Attribute.AccessibilityLabel);
    }
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(TEXT_TESTPAGE);
  }

  get _pageName() {
    return TEXT_TESTPAGE;
  }

  get _primaryComponent() {
    return By(FIRST_TEXT_COMPONENT);
  }

  get _secondaryComponent() {
    return By(SECOND_TEXT_COMPONENT);
  }

  get _firstComponent() {
    return By(FIRST_TEXT_COMPONENT);
  }

  get _secondComponent() {
    return By(SECOND_TEXT_COMPONENT);
  }

  get _thirdComponent() {
    return By(THIRD_TEXT_COMPONENT);
  }

  get _fourthComponent() {
    return By(FOURTH_TEXT_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_TEXT_BUTTON);
  }
}

export default new TextPageObject();
