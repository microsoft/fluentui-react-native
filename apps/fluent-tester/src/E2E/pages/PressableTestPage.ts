import { PRESSABLE_TESTPAGE } from '../../RNTester/Consts';
import { By } from './BootTestPage';

class PressableTestPage {
  isPageLoaded(): boolean {
    return this._pressablePage.isDisplayed();
  }
  get _pressablePage() {
    return By(PRESSABLE_TESTPAGE);
  }
}

export default new PressableTestPage();
