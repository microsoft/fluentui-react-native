import { SHADOW_TESTPAGE, HOMEPAGE_SHADOW_BUTTON } from '../../../TestComponents/Shadow/consts';
import { BasePage, By } from '../../common/BasePage';

class ShadowTestPage extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(SHADOW_TESTPAGE);
  }

  get _pageName() {
    return SHADOW_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_SHADOW_BUTTON);
  }
}

export default new ShadowTestPage();
