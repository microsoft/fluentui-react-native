import { BasePage } from '../../../common/BasePage';
import { TESTPAGE_BUTTONS_SCROLLVIEWER } from '../../../../../fluent-tester/src/TestComponents/Common/consts';

class NativeTestingPageObject extends BasePage {
  async waitForScrollViewDisplayed(timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await this.doesScrollViewParentExist(), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg:
        'For testing purposes we require that the root view contains a non-empty, immutable ScrollView of buttons that navigate to test pages.',
      interval: 1000,
    });
  }

  async doesScrollViewParentExist(): Promise<boolean> {
    return await (await this._testPageButtonScrollViewer).isDisplayed();
  }

  /* Validate the Children of the ScrollView stay intact. The children are the buttons that
   * navigate to each test page. Also, validate these children exist with the proper testId format */
  async validateScrollViewChildren(): Promise<boolean> {
    // Gets all the children
    const testChildren = await (await this._testPageButtonScrollViewer).$$('//*');
    let foundValidButton = false;

    // Ensure the testID (maps 1:1 to automationId) properties of the button children match the defined testing format
    const reg = new RegExp('Homepage_[a-zA-Z]*_Button');

    // Iterate through children. Validate at least one valid button exists as a child to the ScrollView.
    // If automationId is found in the wrong format, return false.
    for await (const child of testChildren) {
      const autoId = await child.getAttribute('AutomationId');
      if (autoId && autoId !== TESTPAGE_BUTTONS_SCROLLVIEWER) {
        if (autoId.match(reg)) {
          foundValidButton = true;
        } else {
          // The correct format for testId was not followed. Return a failure.
          return false;
        }
      }
    }

    return foundValidButton;
  }
}

export default new NativeTestingPageObject();
