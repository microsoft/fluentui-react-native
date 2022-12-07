import { Attribute } from '../../common/consts';
import {
  TEXT_TESTPAGE,
  HOMEPAGE_TEXT_BUTTON,
  V1_TEXT_FIRST_COMPONENT,
  V1_TEXT_SECOND_COMPONENT,
  DEPRECATED_TEXT_FIRST_COMPONENT,
  DEPRECATED_TEXT_SECOND_COMPONENT,
} from '../../../../fluent-tester/src/TestComponents/Text/consts';
import { BasePage, By } from '../../common/BasePage';

export const enum TextComponentSelector {
  V1_First = 0, // this._v1FirstComponent
  V1_Second, // this.__v1SecondComponent
  Deprecated_First, // this._deprecatedFirstComponent
  Deprecated_Second, // this._deprecatedSecondComponent
}

class TextPageObject extends BasePage {
  /* Gets the UI element given the selector */
  async getTextComponent(componentSelector: TextComponentSelector): Promise<WebdriverIO.Element> {
    switch (componentSelector) {
      case TextComponentSelector.V1_First:
        return await this._v1FirstComponent;

      case TextComponentSelector.V1_Second:
        return await this._v1SecondComponent;

      case TextComponentSelector.Deprecated_First:
        return await this._deprecatedFirstComponent;

      case TextComponentSelector.Deprecated_Second:
        return await this._deprecatedSecondComponent;
    }
  }

  /* Gets the accessibility role of an UI element given the selector */
  async getTextAccessibilityRole(componentSelector: TextComponentSelector): Promise<string> {
    return await this.getElementAttribute(await this.getTextComponent(componentSelector), Attribute.AccessibilityRole);
  }

  /* Gets the accessibility label of an UI element given the selector */
  async getTextAccessibilityLabel(componentSelector: TextComponentSelector): Promise<string> {
    return await this.getElementAttribute(await this.getTextComponent(componentSelector), Attribute.AccessibilityLabel);
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

  get _v1FirstComponent() {
    return By(V1_TEXT_FIRST_COMPONENT);
  }

  get _v1SecondComponent() {
    return By(V1_TEXT_SECOND_COMPONENT);
  }

  get _deprecatedFirstComponent() {
    return By(DEPRECATED_TEXT_FIRST_COMPONENT);
  }

  get _deprecatedSecondComponent() {
    return By(DEPRECATED_TEXT_SECOND_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_TEXT_BUTTON);
  }
}

export default new TextPageObject();
