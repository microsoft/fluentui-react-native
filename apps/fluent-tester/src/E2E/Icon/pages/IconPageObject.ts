import {
  ICON_TESTPAGE,
  ICON_TEST_COMPONENT,
  HOMEPAGE_ICON_BUTTON,
  ICON_NO_A11Y_LABEL_COMPONENT,
} from '../../../TestComponents/Icon/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class IconPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(ICON_TESTPAGE);
  }

  get _pageName() {
    return ICON_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(ICON_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return GetElement(ICON_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_ICON_BUTTON);
  }
}

export default new IconPageObject();
