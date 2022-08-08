import {
  BADGE_TESTPAGE,
  HOMEPAGE_BADGE_BUTTON,
  BADGE_TEST_COMPONENT,
  BADGE_SECONDARY_TEST_COMPONENT,
} from '../../../TestComponents/Badge/consts';
import { BasePage, By } from '../../common/BasePage.win';

export const enum BadgeComponentSelector {
  PrimaryComponent, //this._primaryComponent
  SecondaryComponent, //this._secondaryComponent
}
class BasicBadgePageObject extends BasePage {
  getPrimaryComponentAttribute(attribute: string): string {
    return this._primaryComponent.getAttribute(attribute);
  }
  getSecondaryComponentAttribute(attribute: string): string {
    return this._secondaryComponent.getAttribute(attribute);
  }
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(BADGE_TESTPAGE);
  }

  get _pageButton() {
    return By(HOMEPAGE_BADGE_BUTTON);
  }

  get _primaryComponent() {
    return By(BADGE_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(BADGE_SECONDARY_TEST_COMPONENT);
  }
}

export default new BasicBadgePageObject();
