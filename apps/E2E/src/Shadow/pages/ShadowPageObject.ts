import { SHADOW_TESTPAGE, HOMEPAGE_SHADOW_BUTTON } from '../consts';
import { BasePage } from '../../common/BasePage';

class ShadowTestPage extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return SHADOW_TESTPAGE;
  }

  get _pageButtonName() {
    return HOMEPAGE_SHADOW_BUTTON;
  }
}

export default new ShadowTestPage();
