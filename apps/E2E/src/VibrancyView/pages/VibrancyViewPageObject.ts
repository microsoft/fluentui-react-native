import { BasePage } from '../../common/BasePage';
import { VIBRANCYVIEW_TESTPAGE, HOMEPAGE_VIBRANCYVIEW_BUTTON } from '../consts';

class VibrancyViewTestPage extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return VIBRANCYVIEW_TESTPAGE;
  }

  get _pageButtonName() {
    return HOMEPAGE_VIBRANCYVIEW_BUTTON;
  }
}

export default new VibrancyViewTestPage();
