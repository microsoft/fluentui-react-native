import { BasePage } from '../../common/BasePage';
import { HOMEPAGE_SPINNER_BUTTON, SPINNER_TESTPAGE, SPINNER_TEST_COMPONENT } from '../consts';

class SpinnerPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return SPINNER_TESTPAGE;
  }

  get _primaryComponentName() {
    return SPINNER_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_SPINNER_BUTTON;
  }
}

export default new SpinnerPageObject();
