import {
  CALLOUT_TESTPAGE,
  CALLOUT_TEST_COMPONENT,
  HOMEPAGE_CALLOUT_BUTTON,
  BUTTON_TO_OPEN_CALLOUT,
} from '../../../FluentTester/TestComponents/Callout/consts';
import { BasePage, By, COMPONENT_SCROLL_COORDINATES } from '../../common/BasePage.win';

class CalloutPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  didCalloutLoad(): boolean {
    return this._primaryComponent.isDisplayed();
  }

  /* OVERRIDE: This must scroll to the button that opens the callout, not the callout (since it's not visible on load.) */
  scrollToTestElement(): void {
    while (!this._buttonToOpenCallout.isDisplayed()) {
      driver.touchScroll(COMPONENT_SCROLL_COORDINATES.x, COMPONENT_SCROLL_COORDINATES.y, this._testPage.elementId);
    }
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _testPage() {
    return By(CALLOUT_TESTPAGE);
  }

  get _pageName() {
    return CALLOUT_TESTPAGE;
  }

  get _primaryComponent() {
    return By(CALLOUT_TEST_COMPONENT);
  }

  get _pageButton() {
    return By(HOMEPAGE_CALLOUT_BUTTON);
  }

  get _buttonToOpenCallout() {
    return By(BUTTON_TO_OPEN_CALLOUT);
  }
}

export default new CalloutPageObject();
