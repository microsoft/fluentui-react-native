import { CHECKBOX_TESTPAGE } from '../../RNTester/Consts';
import { By } from './BootTestPage';

class CheckboxTestPage {
  isPageLoaded(): boolean {
    return this._checkboxPage.isDisplayed();
  }
  get _checkboxPage() {
    return By(CHECKBOX_TESTPAGE);
  }
}

export default new CheckboxTestPage();
