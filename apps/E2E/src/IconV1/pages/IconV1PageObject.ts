import { ICON_TESTPAGE, ICON_TEST_COMPONENT, HOMEPAGE_ICON_BUTTON, ICON_FONT_TEST_COMPONENT } from '../../IconLegacy/consts';
import { BasePage, By } from '../../common/BasePage';

class IconV1PageObject extends BasePage {
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
    return By(ICON_FONT_TEST_COMPONENT);
  }

  get _pageButtonName() {
    return HOMEPAGE_ICON_BUTTON;
  }
}

export default new IconV1PageObject();
