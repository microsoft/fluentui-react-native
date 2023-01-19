import { ICON_TESTPAGE, ICON_TEST_COMPONENT, HOMEPAGE_ICON_BUTTON, ICON_NO_A11Y_LABEL_COMPONENT } from '../consts';
import { BasePage, By } from '../../common/BasePage';

class IconLegacyPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return ICON_TESTPAGE;
  }

  get _primaryComponent() {
    return By(ICON_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(ICON_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_ICON_BUTTON;
  }
}

export default new IconLegacyPageObject();
