import { ICON_TESTPAGE, ICON_TEST_COMPONENT, HOMEPAGE_ICON_BUTTON, ICON_NO_A11Y_LABEL_COMPONENT } from '../consts';
import { BasePage, By } from '../../common/BasePage';

class IconLegacyPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(ICON_TESTPAGE);
  }

  get _pageName() {
    return ICON_TESTPAGE;
  }

  get _primaryComponentName() {
    return ICON_TEST_COMPONENT;
  }

  get _secondaryComponentName() {
    return ICON_NO_A11Y_LABEL_COMPONENT;
  }

  get _pageButton() {
    return By(HOMEPAGE_ICON_BUTTON);
  }
}

export default new IconLegacyPageObject();
