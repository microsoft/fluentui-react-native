import { BasePage } from '../../common/BasePage';
import { AVATAR_TESTPAGE, HOMEPAGE_AVATAR_BUTTON, AVATAR_TEST_COMPONENT, AVATAR_SECONDARY_TEST_COMPONENT } from '../consts';
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

  get _primaryComponentName() {
    return AVATAR_TEST_COMPONENT;
  }

  get _secondaryComponentName() {
    return AVATAR_SECONDARY_TEST_COMPONENT;
  }
}

export default new AvatarPageObject();
