import { BasePage } from '../../common/BasePage';
import { BADGE_SECONDARY_TEST_COMPONENT, BADGE_TESTPAGE, BADGE_TEST_COMPONENT, HOMEPAGE_BADGE_BUTTON } from '../consts';

class BasicBadgePageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageButtonName() {
    return HOMEPAGE_BADGE_BUTTON;
  }

  get _pageName() {
    return BADGE_TESTPAGE;
  }

  get _primaryComponentName() {
    return BADGE_TEST_COMPONENT;
  }

  get _secondaryComponentName() {
    return BADGE_SECONDARY_TEST_COMPONENT;
  }
}

export default new BasicBadgePageObject();
