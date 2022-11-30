import {
  PERSONACOIN_TESTPAGE,
  PERSONACOIN_TEST_COMPONENT,
  HOMEPAGE_PERSONACOIN_BUTTON,
} from '../../../../fluent-tester/src/TestComponents/PersonaCoin/consts';
import { BasePage, By } from '../../common/BasePage';

class PersonaCoinPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(PERSONACOIN_TESTPAGE);
  }

  get _pageName() {
    return PERSONACOIN_TESTPAGE;
  }

  get _primaryComponent() {
    return By(PERSONACOIN_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_PERSONACOIN_BUTTON);
  }
}

export default new PersonaCoinPageObject();
