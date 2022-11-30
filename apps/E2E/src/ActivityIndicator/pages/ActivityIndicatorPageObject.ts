import {
  HOMEPAGE_ACTIVITY_INDICATOR_BUTTON,
  ACTIVITY_INDICATOR_TESTPAGE,
  ACTIVITY_INDICATOR_TEST_COMPONENT,
} from '../../../../fluent-tester/src/TestComponents/ActivityIndicator/consts';
import { BasePage, By } from '../../common/BasePage';

class ActivityIndicatorPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(ACTIVITY_INDICATOR_TESTPAGE);
  }

  get _pageName() {
    return ACTIVITY_INDICATOR_TESTPAGE;
  }

  get _primaryComponent() {
    return By(ACTIVITY_INDICATOR_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_ACTIVITY_INDICATOR_BUTTON);
  }
}

export default new ActivityIndicatorPageObject();
