import {
  BADGE_TESTPAGE,
  HOMEPAGE_BADGE_BUTTON,
  COUNTER_BADGE_TEST_COMPONENT,
  COUNTER_BADGE_SECONDARY_TEST_COMPONENT,
  COUNTER_BADGE_TERTIARY_COMPONENT,
} from '../../../TestComponents/Badge/consts';
import { BasePage, By } from '../../common/BasePage.win';

export const enum BadgeComponentSelector {
  PrimaryComponent, //this._primaryComponent
  SecondaryComponent, //this._secondaryComponent
  TertiaryComponent, // this._tertiaryComponent
}
class CounterBadgePageObject extends BasePage {
  getPrimaryComponentText(): string {
    return this._primaryComponent.getText();
  }
  getSecondaryComponentText(): string {
    return this._secondaryComponent.getText();
  }
  getTertiaryComponentText(): string {
    return this._tertiaryComponent.getText();
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
    return By(COUNTER_BADGE_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(COUNTER_BADGE_SECONDARY_TEST_COMPONENT);
  }

  get _tertiaryComponent() {
    return By(COUNTER_BADGE_TERTIARY_COMPONENT);
  }
}

export default new CounterBadgePageObject();
