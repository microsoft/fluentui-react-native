import {
  SEPARATOR_TESTPAGE,
  SEPARATOR_TEST_COMPONENT,
  HOMEPAGE_SEPARATOR_BUTTON,
} from '../../../../fluent-tester/src/TestComponents/Separator/consts';
import { BasePage, By } from '../../common/BasePage';

class SeparatorPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(SEPARATOR_TESTPAGE);
  }

  get _pageName() {
    return SEPARATOR_TESTPAGE;
  }

  get _primaryComponent() {
    return By(SEPARATOR_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_SEPARATOR_BUTTON);
  }
}

export default new SeparatorPageObject();
