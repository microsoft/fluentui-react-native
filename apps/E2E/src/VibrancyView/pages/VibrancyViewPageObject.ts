import { BasePage } from '../../common/BasePage';
import { VIBRANCYVIEW_TESTPAGE, VIBRANCYVIEW_TEST_COMPONENT, HOMEPAGE_VIBRANCYVIEW_BUTTON } from '../consts';

class VibrancyViewTestPage extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return VIBRANCYVIEW_TESTPAGE;
  }

  get _primaryComponentName() {
    return VIBRANCYVIEW_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_VIBRANCYVIEW_BUTTON;
  }
}

export default new VibrancyViewTestPage();
