import { TEXT_TESTPAGE } from '../../RNTester/Consts';
import { By } from './BootTestPage';

class TextTestPage {
  isPageLoaded(): boolean {
    return this._textPage.isDisplayed();
  }

  get _textPage() {
    return By(TEXT_TESTPAGE);
  }
}

export default new TextTestPage();
