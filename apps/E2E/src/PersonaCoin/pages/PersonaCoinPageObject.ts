import { BasePage } from '../../common/BasePage';
import { PERSONACOIN_TESTPAGE, PERSONACOIN_TEST_COMPONENT, HOMEPAGE_PERSONACOIN_BUTTON } from '../consts';

class PersonaCoinPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return PERSONACOIN_TESTPAGE;
  }

  get _primaryComponentName() {
    return PERSONACOIN_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_PERSONACOIN_BUTTON;
  }
}

export default new PersonaCoinPageObject();
