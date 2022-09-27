import {
  CALLOUT_TESTPAGE,
  CALLOUT_TEST_COMPONENT,
  HOMEPAGE_CALLOUT_BUTTON,
  BUTTON_TO_OPEN_CALLOUT,
} from '../../../TestComponents/Callout/consts';
import { BasePage, GetElement } from '../../common/BasePage';

class CalloutPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async didCalloutLoad(): Promise<boolean> {
    return await (await this._primaryComponent).isDisplayed();
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return GetElement(CALLOUT_TESTPAGE);
  }

  get _pageName() {
    return CALLOUT_TESTPAGE;
  }

  get _primaryComponent() {
    return GetElement(CALLOUT_TEST_COMPONENT);
  }

  get _pageButton() {
    return GetElement(HOMEPAGE_CALLOUT_BUTTON);
  }

  get _buttonToOpenCallout() {
    return GetElement(BUTTON_TO_OPEN_CALLOUT);
  }
}

export default new CalloutPageObject();
