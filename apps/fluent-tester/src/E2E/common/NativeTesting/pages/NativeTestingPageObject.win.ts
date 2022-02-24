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
          'The ScrollView containing all test page buttons was not found. Did you remove the ScrollView or change the testID? The testID must stay constant to align with our native code.',
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

    // All the button children have the same format. We want to find these buttons
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
