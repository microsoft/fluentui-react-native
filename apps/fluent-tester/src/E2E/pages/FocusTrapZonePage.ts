import { FOCUSTRAPZONE_TESTPAGE } from '../../RNTester/Consts';
import { By } from './BootTestPage';

class FocusTrapZonePage {
  isPageLoaded(): boolean {
    return this._focusTrapZonePage.isDisplayed();
  }
  get _focusTrapZonePage() {
    return By(FOCUSTRAPZONE_TESTPAGE);
  }
}

export default new FocusTrapZonePage();
