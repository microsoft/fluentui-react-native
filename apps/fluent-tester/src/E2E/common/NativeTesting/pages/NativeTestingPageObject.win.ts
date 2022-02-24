import { SCROLLVIEW_PARENT_CONTAINER } from '../../../../FluentTester/FluentTester';
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

  // getScrollViewChildren() {
  //   let testChildren = this._scrollViewParent.chil
  // }

  get _scrollViewParent() {
    return By(SCROLLVIEW_PARENT_CONTAINER);
  }
}

export default new NativeTestingPageObject();
