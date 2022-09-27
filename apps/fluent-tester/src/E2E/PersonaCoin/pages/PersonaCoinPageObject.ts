import { PERSONACOIN_TESTPAGE, PERSONACOIN_TEST_COMPONENT, HOMEPAGE_PERSONACOIN_BUTTON } from '../../../TestComponents/PersonaCoin/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class PersonaCoinPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(PERSONACOIN_TESTPAGE);
  }

  get _pageName() {
    return PERSONACOIN_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(PERSONACOIN_TEST_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_PERSONACOIN_BUTTON);
  }
}

export default new PersonaCoinPageObject();
