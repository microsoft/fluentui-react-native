import { FOCUSTRAPZONE_TESTPAGE } from '../../../RNTester/TestComponents/FocusTrapZone/consts';
import { BasePage, By } from '../../common/BasePage';

class FocusTrapZonePage extends BasePage {
  get _testPage() {
    return By(FOCUSTRAPZONE_TESTPAGE);
  }

  get _pageName() {
    return FOCUSTRAPZONE_TESTPAGE;
  }
}

export default new FocusTrapZonePage();
