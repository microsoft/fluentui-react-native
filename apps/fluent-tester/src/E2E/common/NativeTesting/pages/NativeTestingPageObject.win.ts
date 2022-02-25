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

  validateScrollViewChildren(): boolean {
    // Gets all the children
    const testChildren = this._scrollViewParent.$$('//*');

    // Ensure the AutomationId (maps 1:1 to testId) properties of the button children match the defined testing format
    const reg = new RegExp('Homepage_[a-zA-Z]*_Button');

    for (const child of testChildren) {
      const autoId = child.getAttribute('AutomationId');
      if (autoId && autoId.match(reg)) {
        return true;
      }
    }

    return false;
  }

  get _scrollViewParent() {
    return By('SCROLLVIEW_TEST_ID');
  }
}

export default new NativeTestingPageObject();
