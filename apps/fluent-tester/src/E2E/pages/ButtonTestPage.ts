import { BUTTON_TESTPAGE } from '../../RNTester/Consts';
import { By } from './BootTestPage';

class ButtonTestPage {
  isPageLoaded(): boolean {
    return this._buttonPage.isDisplayed();
  }

  get _buttonPage() {
    return By(BUTTON_TESTPAGE);
  }
}

export default new ButtonTestPage();
