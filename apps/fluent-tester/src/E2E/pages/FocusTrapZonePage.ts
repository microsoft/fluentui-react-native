import { FOCUSTRAPZONE_TESTPAGE } from '../../RNTester/Consts';
import { BasePage, By } from './BasePage';

class FocusTrapZonePage extends BasePage {
  get _testPage() {
    return By(FOCUSTRAPZONE_TESTPAGE);
  }
}

export default new FocusTrapZonePage();
