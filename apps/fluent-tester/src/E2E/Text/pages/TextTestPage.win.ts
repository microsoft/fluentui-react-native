import { TEXT_TESTPAGE } from '../../../RNTester/TestComponents/Text/consts';
import { BasePage, By } from '../../common/BasePage';

class TextTestPage extends BasePage {
  get _testPage() {
    return By(TEXT_TESTPAGE);
  }
}

export default new TextTestPage();
