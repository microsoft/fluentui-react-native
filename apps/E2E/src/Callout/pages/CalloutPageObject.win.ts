import {
  CALLOUT_TESTPAGE,
  CALLOUT_TEST_COMPONENT,
  HOMEPAGE_CALLOUT_BUTTON,
  BUTTON_TO_OPEN_CALLOUT,
} from '../../../../fluent-tester/src/TestComponents/Callout/consts';
import { BasePage, By } from '../../common/BasePage';

class CalloutPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async didCalloutLoad(): Promise<boolean> {
    return await (await this._primaryComponent).isDisplayed();
  }

  // This both opens and waits for it to go in view
  async openCalloutAndWaitForLoad(): Promise<void> {
    await (await this._buttonToOpenCallout).click();
    await this.waitForCondition(
      async () => await this.didCalloutLoad(),
      'The testing callout failed to display after attempting to open it.',
    );
  }

  async closeCallout(): Promise<void> {
    // all we have to do is click outside the callout
    await (await this._testPage).click();
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
