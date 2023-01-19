import { AVATAR_TESTPAGE, HOMEPAGE_AVATAR_BUTTON, AVATAR_TEST_COMPONENT, AVATAR_SECONDARY_TEST_COMPONENT } from '../consts';
import { BasePage, By } from '../../common/BasePage';
class AvatarPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageButtonName() {
    return HOMEPAGE_AVATAR_BUTTON;
  }

  get _pageName() {
    return AVATAR_TESTPAGE;
  }

  get _primaryComponent() {
    return By(AVATAR_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(AVATAR_SECONDARY_TEST_COMPONENT);
  }
}

export default new AvatarPageObject();
