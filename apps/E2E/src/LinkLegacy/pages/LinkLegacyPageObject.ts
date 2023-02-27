import { BasePage } from '../../common/BasePage';
import { LINK_TESTPAGE, LINK_TEST_COMPONENT, HOMEPAGE_LINK_BUTTON, LINK_NO_A11Y_LABEL_COMPONENT } from '../consts';

class LinkLegacyPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return LINK_TESTPAGE;
  }

  get _primaryComponentName() {
    return LINK_TEST_COMPONENT;
  }

  get _secondaryComponentName() {
    return LINK_NO_A11Y_LABEL_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_LINK_BUTTON;
  }
}

export default new LinkLegacyPageObject();
