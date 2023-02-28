import { BasePage } from '../../common/BasePage';
import { HOMEPAGE_CORNERRADIUS_TESTPAGE, HOMEPAGE_CORNERRADIUS_BUTTON } from '../consts';

class CornerRadiusTokensPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return HOMEPAGE_CORNERRADIUS_TESTPAGE;
  }

  get _pageButtonName() {
    return HOMEPAGE_CORNERRADIUS_BUTTON;
  }
}

export default new CornerRadiusTokensPageObject();
