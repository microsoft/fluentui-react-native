import {
  LINK_TESTPAGE,
  LINK_TEST_COMPONENT,
  HOMEPAGE_LINK_BUTTON,
  LINK_NO_A11Y_LABEL_COMPONENT,
} from '../../../TestComponents/Link/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class LinkPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(LINK_TESTPAGE);
  }

  get _pageName() {
    return LINK_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(LINK_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return GetElement(LINK_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_LINK_BUTTON);
  }
}

export default new LinkPageObject();
