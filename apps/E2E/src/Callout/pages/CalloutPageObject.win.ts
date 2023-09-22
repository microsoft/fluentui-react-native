import { BasePage, By } from '../../common/BasePage';
import { CALLOUT_TESTPAGE, CALLOUT_TEST_COMPONENT, HOMEPAGE_CALLOUT_BUTTON, BUTTON_TO_OPEN_CALLOUT } from '../consts';

class CalloutPageObject extends BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async isCalloutOpen(): Promise<boolean> {
    return await (await this._primaryComponent).isDisplayed();
  }

  // This both opens and waits for it to go in view
  async openCalloutAndWaitForLoad(): Promise<void> {
    if (!(await this.isCalloutOpen())) {
      const calloutButton = await this._buttonToOpenCallout;
      await browser.waitUntil(async () => await calloutButton.isEnabled(),
      {
        timeout: 15000,
        timeoutMsg: 'Button to open the Callout is not enabled.'
      });

      await calloutButton.click();
      await this.waitForCondition(
        async () => await this.isCalloutOpen(),
        'Clicked the button to open the Callout, but the Callout did not open correctly.',
      );
    }
  }

  async closeCallout(): Promise<void> {
    // all we have to do is click outside the callout
    await (await this._testPage).click();
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
