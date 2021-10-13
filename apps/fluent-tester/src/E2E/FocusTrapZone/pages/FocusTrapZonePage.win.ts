import { FOCUSTRAPZONE_TESTPAGE, HOMEPAGE_FOCUSTRAPZONE_BUTTON } from '../../../FluentTester/TestComponents/FocusTrapZone/consts';
import { BasePage, By } from '../../common/BasePage';

class FocusTrapZonePage extends BasePage {
  get _testPage() {
    return By(FOCUSTRAPZONE_TESTPAGE);
  }

  get _pageName() {
    return FOCUSTRAPZONE_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_FOCUSTRAPZONE_BUTTON);
  }
}

export default new FocusTrapZonePage();
