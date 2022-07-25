import {
  AVATAR_TESTPAGE,
  HOMEPAGE_AVATAR_BUTTON,
  AVATAR_TEST_COMPONENT,
  AVATAR_SECONDARY_TEST_COMPONENT,
} from '../../../TestComponents/Avatar/consts';
import { BasePage, By } from '../../common/BasePage.win';

export const enum AvatarComponentSelector {
  PrimaryComponent, //this._primaryComponent
  SecondaryComponent, //this._secondaryComponent
}
class AvatarPageObject extends BasePage {
  getPrimaryComponentAttribute(attribute: string): string {
    return this._primaryComponent.getAttribute(attribute);
  }
  getSecondaryComponentAttribute(attribute: string): string {
    return this._secondaryComponent.getAttribute(attribute);
  }
  getAvatarAccessibilityLabel(componentSelector: AvatarComponentSelector): string {
    return componentSelector == AvatarComponentSelector.SecondaryComponent
      ? this._secondaryComponent.getAttribute('Name')
      : this._primaryComponent.getAttribute('Name');
  }

  getAvatarAccessibilityHint(componentSelector: AvatarComponentSelector): string {
    return componentSelector == AvatarComponentSelector.SecondaryComponent
      ? this._secondaryComponent.getAttribute('HelpText')
      : this._primaryComponent.getAttribute('HelpText');
  }

  getAvatarAccessibilityRole(componentSelector: AvatarComponentSelector): string {
    return componentSelector == AvatarComponentSelector.SecondaryComponent
      ? this._secondaryComponent.getAttribute('ControlType')
      : this._primaryComponent.getAttribute('ControlType');
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
