import { TEXT_TESTPAGE } from '../../../FluentTester/TestComponents/TextExperimental/consts';
import { BasePage, By } from '../../common/BasePage';

class TextExperimentalTestPage extends BasePage {
  get _testPage() {
    return By(TEXT_TESTPAGE);
  }

  get _pageName() {
    return TEXT_TESTPAGE;
  }
}

export default new TextExperimentalTestPage();
