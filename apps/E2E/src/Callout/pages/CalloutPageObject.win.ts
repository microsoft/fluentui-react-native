import { BasePage, By } from '../../common/BasePage';
import { CALLOUT_TESTPAGE, CALLOUT_TEST_COMPONENT, HOMEPAGE_CALLOUT_BUTTON, BUTTON_TO_OPEN_CALLOUT } from '../consts';

class CalloutPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async isCalloutOpen(): Promise<boolean> {
    return this._primaryComponent.isDisplayed();
  }

  // This both opens and waits for it to go in view
  async openCalloutAndWaitForLoad(): Promise<void> {
    if (!(await this.isCalloutOpen())) {
      await this._buttonToOpenCallout.waitForEnabled({ timeoutMsg: 'Button to open the Callout is not enabled.' });

      await this._buttonToOpenCallout.click();
      await this._primaryComponent.waitForDisplayed({
        timeoutMsg: 'Clicked the button to open the Callout, but the Callout did not open correctly',
      });
    }
  }

  async closeCallout(): Promise<void> {
    // all we have to do is click outside the callout
    this._testPage.click();
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/
  get _pageName() {
    return CALLOUT_TESTPAGE;
  }

  get _primaryComponentName() {
    return CALLOUT_TEST_COMPONENT;
  }

  get _pageButtonName() {
    return HOMEPAGE_CALLOUT_BUTTON;
  }

  get _buttonToOpenCallout() {
    return By(BUTTON_TO_OPEN_CALLOUT);
  }
}

export default new CalloutPageObject();
