import {
  AVATAR_TESTPAGE,
  HOMEPAGE_AVATAR_BUTTON,
  AVATAR_TEST_COMPONENT,
  AVATAR_SECONDARY_TEST_COMPONENT,
} from '../../../../fluent-tester/src/TestComponents/Avatar/consts';
import { BasePage, By } from '../../common/BasePage';

export const enum AvatarComponentSelector {
  PrimaryComponent, //this._primaryComponent
  SecondaryComponent, //this._secondaryComponent
}
class AvatarPageObject extends BasePage {
  async getPrimaryComponentAttribute(attribute: string): Promise<string> {
    return await (await this._primaryComponent).getAttribute(attribute);
  }

  async getSecondaryComponentAttribute(attribute: string): Promise<string> {
    return await (await this._secondaryComponent).getAttribute(attribute);
  }

  async getAvatarAccessibilityLabel(componentSelector: AvatarComponentSelector): Promise<string> {
    return componentSelector == AvatarComponentSelector.SecondaryComponent
      ? await (await this._secondaryComponent).getAttribute('Name')
      : await (await this._primaryComponent).getAttribute('Name');
  }

  async getAvatarAccessibilityHint(componentSelector: AvatarComponentSelector): Promise<string> {
    return componentSelector == AvatarComponentSelector.SecondaryComponent
      ? await (await this._secondaryComponent).getAttribute('HelpText')
      : await (await this._primaryComponent).getAttribute('HelpText');
  }

  async getAvatarAccessibilityRole(componentSelector: AvatarComponentSelector): Promise<string> {
    return componentSelector == AvatarComponentSelector.SecondaryComponent
      ? await (await this._secondaryComponent).getAttribute('ControlType')
      : await (await this._primaryComponent).getAttribute('ControlType');
  }
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(AVATAR_TESTPAGE);
  }

  get _pageButton() {
    return By(HOMEPAGE_AVATAR_BUTTON);
  }

  get _primaryComponent() {
    return By(AVATAR_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(AVATAR_SECONDARY_TEST_COMPONENT);
  }
}

export default new AvatarPageObject();
