import {
  BADGE_TESTPAGE,
  HOMEPAGE_BADGE_BUTTON,
  BADGE_TEST_COMPONENT,
  BADGE_SECONDARY_TEST_COMPONENT,
} from '../../../TestComponents/Badge/consts';
import { BasePage, GetElement } from '../../common/BasePage';

export const enum BadgeComponentSelector {
  PrimaryComponent, //this._primaryComponent
  SecondaryComponent, //this._secondaryComponent
}

class BasicBadgePageObject extends BasePage {
  async getPrimaryComponentAttribute(attribute: string): Promise<string> {
    return await (await this._primaryComponent).getAttribute(attribute);
  }

  async getSecondaryComponentAttribute(attribute: string): Promise<string> {
    return await (await this._secondaryComponent).getAttribute(attribute);
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(BADGE_TESTPAGE);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_BADGE_BUTTON);
  }

  get _primaryComponent() {
    return GetElement(BADGE_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return GetElement(BADGE_SECONDARY_TEST_COMPONENT);
  }
}

export default new BasicBadgePageObject();
