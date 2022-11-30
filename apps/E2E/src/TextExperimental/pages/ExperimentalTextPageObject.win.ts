import {
  EXPERIMENTAL_TEXT_TESTPAGE,
  EXPERIMENTAL_TEXT_TEST_COMPONENT,
  HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON,
} from '../../../../fluent-tester/src/TestComponents/TextExperimental/consts';
import { BasePage, By } from '../../common/BasePage';

class ExperimentalTextPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(EXPERIMENTAL_TEXT_TESTPAGE);
  }

  get _pageName() {
    return EXPERIMENTAL_TEXT_TESTPAGE;
  }

  get _primaryComponent() {
    return By(EXPERIMENTAL_TEXT_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON);
  }
}

export default new ExperimentalTextPageObject();
