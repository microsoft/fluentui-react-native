import {
  ICON_TESTPAGE,
  ICON_TEST_COMPONENT,
  HOMEPAGE_ICON_BUTTON,
  ICON_FONT_TEST_COMPONENT,
} from '../../../../fluent-tester/src/TestComponents/Icon/consts';
import { BasePage, By } from '../../common/BasePage';

class IconPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(ICON_TESTPAGE);
  }

  get _pageName() {
    return ICON_TESTPAGE;
  }

  get _primaryComponent() {
    return By(ICON_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(ICON_FONT_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_ICON_BUTTON);
  }
}

export default new IconPageObject();
