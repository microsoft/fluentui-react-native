import { BasePage, By } from '../../../common/BasePage.win';

const ScrollViewTestId = 'SCROLLVIEW_TEST_ID';

class NativeTestingPageObject extends BasePage {
  waitForScrollViewDisplayed(timeout?: number): void {
    browser.waitUntil(
      () => {
        return this.doesScrollViewParentExist();
      },
      {
        timeout: timeout ?? this.waitForPageTimeout,
        timeoutMsg:
          'For testing purposes we require that the root view contains a non-empty, immutable ScrollView of buttons that navigate to test pages.',
        interval: 1000,
      },
    );
  }

  doesScrollViewParentExist(): boolean {
    return this._scrollViewParent.isExisting();
  }

  /* Validate the Children of the ScrollView stay intact. The children are the buttons that
   * navigate to each test page. Also, validate these children exist with the proper testId format */
  validateScrollViewChildren(): boolean {
    // Gets all the children
    const testChildren = this._scrollViewParent.$$('//*');
    let foundValidButton = false;

    // Ensure the testID (maps 1:1 to automationId) properties of the button children match the defined testing format
    const reg = new RegExp('Homepage_[a-zA-Z]*_Button');

    // Iterate through children. Validate at least one valid button exists as a child to the ScrollView.
    // If automationId is found in the wrong format, return false.
    for (const child of testChildren) {
      const autoId = child.getAttribute('AutomationId');
      if (autoId && autoId !== ScrollViewTestId) {
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

  get _scrollViewParent() {
    return By(ScrollViewTestId);
  }
}

export default new NativeTestingPageObject();
