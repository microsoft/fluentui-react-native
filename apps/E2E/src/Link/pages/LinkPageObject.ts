import {
  LINK_TESTPAGE,
  LINK_TEST_COMPONENT,
  HOMEPAGE_LINK_BUTTON,
  LINK_NO_A11Y_LABEL_COMPONENT,
} from '../../../../fluent-tester/src/TestComponents/Link/consts';
import { BasePage, By } from '../../common/BasePage';

class LinkPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(LINK_TESTPAGE);
  }

  get _pageName() {
    return LINK_TESTPAGE;
  }

  get _primaryComponent() {
    return By(LINK_TEST_COMPONENT);
  }

  get _secondaryComponent() {
    return By(LINK_NO_A11Y_LABEL_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_LINK_BUTTON);
  }
}

export default new LinkPageObject();
