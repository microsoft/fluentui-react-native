import {
  EXPERIMENTAL_TEXT_TESTPAGE,
  EXPERIMENTAL_TEXT_TEST_COMPONENT,
  HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON,
} from '../../../TestComponents/TextExperimental/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class ExperimentalTextPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(EXPERIMENTAL_TEXT_TESTPAGE);
  }

  get _pageName() {
    return EXPERIMENTAL_TEXT_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(EXPERIMENTAL_TEXT_TEST_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON);
  }
}

export default new ExperimentalTextPageObject();
