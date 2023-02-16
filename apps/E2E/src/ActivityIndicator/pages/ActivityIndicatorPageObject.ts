import { BasePage } from '../../common/BasePage';
import { HOMEPAGE_ACTIVITY_INDICATOR_BUTTON, ACTIVITY_INDICATOR_TESTPAGE, ACTIVITY_INDICATOR_TEST_COMPONENT } from '../consts';

class ActivityIndicatorPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return ACTIVITY_INDICATOR_TESTPAGE;
  }

  get _primaryComponentName() {
    return ACTIVITY_INDICATOR_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_ACTIVITY_INDICATOR_BUTTON;
  }
}

export default new ActivityIndicatorPageObject();
