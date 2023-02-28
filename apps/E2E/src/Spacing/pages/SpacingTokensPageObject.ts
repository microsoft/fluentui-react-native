import { BasePage } from '../../common/BasePage';
import { SPACING_TESTPAGE, HOMEPAGE_SPACING_BUTTON } from '../consts';

class SpacingTokensPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return SPACING_TESTPAGE;
  }

  get _pageButtonName() {
    return HOMEPAGE_SPACING_BUTTON;
  }
}

export default new SpacingTokensPageObject();
