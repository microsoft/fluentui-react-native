import { LINK_TESTPAGE } from '../../RNTester/Consts';
import { By } from './BootTestPage';

class LinkTestPage {
  isPageLoaded(): boolean {
    return this._linkPage.isDisplayed();
  }
  get _linkPage() {
    return By(LINK_TESTPAGE);
  }
}

export default new LinkTestPage();
