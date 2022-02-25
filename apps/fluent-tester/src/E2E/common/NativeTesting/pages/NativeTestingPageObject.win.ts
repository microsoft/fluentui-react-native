import { BasePage, By } from '../../../common/BasePage.win';

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

  validateScrollViewChildren() {
    // Gets all the children
    const testChildren = this._scrollViewParent.$$('//*');

    // Ensure the AutomationId (maps 1:1 to testId) properties of the button children match the defined testing format
    const reg = new RegExp('Homepage_[a-zA-Z]*_Button');
    const buttonList = [];

    testChildren.forEach((child) => {
      const autoId = child.getAttribute('AutomationId');
      if (autoId && child.getAttribute('AutomationId').match(reg)) {
        buttonList.push(child);
      }
    });

    return buttonList.length > 0;
  }

  get _scrollViewParent() {
    return By('SCROLLVIEW_TEST_ID');
  }
}

export default new NativeTestingPageObject();
