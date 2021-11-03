import { PRESSABLE_TESTPAGE, HOMEPAGE_PRESSABLE_BUTTON } from '../../../FluentTester/TestComponents/Pressable/consts';
import { BasePage, By } from '../../common/BasePage';

class PressableTestPage extends BasePage {
  get _testPage() {
    return By(PRESSABLE_TESTPAGE);
  }

  get _pageName() {
    return PRESSABLE_TESTPAGE;
  }

  get _pageButton() {
    return By(HOMEPAGE_PRESSABLE_BUTTON);
  }
}

export default new PressableTestPage();
