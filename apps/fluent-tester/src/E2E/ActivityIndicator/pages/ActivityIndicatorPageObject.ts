import {
  HOMEPAGE_ACTIVITY_INDICATOR_BUTTON,
  ACTIVITY_INDICATOR_TESTPAGE,
  ACTIVITY_INDICATOR_TEST_COMPONENT,
} from '../../../TestComponents/ActivityIndicator/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class ActivityIndicatorPageObject extends BasePage {
  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(ACTIVITY_INDICATOR_TESTPAGE);
  }

  get _pageName() {
    return ACTIVITY_INDICATOR_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(ACTIVITY_INDICATOR_TEST_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_ACTIVITY_INDICATOR_BUTTON);
  }
}

export default new ActivityIndicatorPageObject();
