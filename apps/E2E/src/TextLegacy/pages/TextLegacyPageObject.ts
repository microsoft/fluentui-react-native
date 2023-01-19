import { Attribute } from '../../common/consts';
import { TEXT_TESTPAGE, HOMEPAGE_TEXT_BUTTON, DEPRECATED_TEXT_FIRST_COMPONENT, DEPRECATED_TEXT_SECOND_COMPONENT } from '../consts';
import { BasePage, By } from '../../common/BasePage';

export const enum TextComponentSelector {
  Deprecated_First, // this._deprecatedFirstComponent
  Deprecated_Second, // this._deprecatedSecondComponent
}

class TextLegacyPageObject extends BasePage {
  /* Gets the UI element given the selector */
  async getTextComponent(componentSelector: TextComponentSelector): Promise<WebdriverIO.Element> {
    switch (componentSelector) {
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
  get _pageName() {
    return TEXT_TESTPAGE;
  }

  get _deprecatedFirstComponent() {
    return By(DEPRECATED_TEXT_FIRST_COMPONENT);
  }

  get _deprecatedSecondComponent() {
    return By(DEPRECATED_TEXT_SECOND_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_TEXT_BUTTON;
  }
}

export default new TextLegacyPageObject();
