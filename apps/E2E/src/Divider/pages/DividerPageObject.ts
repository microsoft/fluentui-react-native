import { BasePage } from '../../common/BasePage';
import { DIVIDER_TESTPAGE, HOMEPAGE_DIVIDER_BUTTON } from '../consts';

class DividerPageObject extends BasePage {
  get _pageName(): string {
    return DIVIDER_TESTPAGE;
  }

  get _pageButtonName(): string {
    return HOMEPAGE_DIVIDER_BUTTON;
  }
}

export default new DividerPageObject();
