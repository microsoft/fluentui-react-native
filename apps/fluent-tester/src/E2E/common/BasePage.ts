const DUMMY_CHAR = '';
const COMPONENT_SCROLL_COORDINATES = { x: -0, y: -40 }; // These are the offsets. Y is negative because we want the touch to move up (and thus it scrolls down)

export function By(testId: string): WebdriverIO.Element {
  return $('~' + testId);
}

export class BasePage {
  isPageLoaded(): boolean {
    return this._testPage.isDisplayed();
  }

  isButtonInView(): boolean {
    return this._pageButton.isDisplayed();
  }

  // Scrolls to the component button in the list of components.
  scrollToComponentButton(): void {
    if (!this.isButtonInView()) {
      const scrollViewElement = $('~SCROLLVIEW_TEST_ID');
      driver.touchScroll(COMPONENT_SCROLL_COORDINATES.x, COMPONENT_SCROLL_COORDINATES.y, scrollViewElement.elementId);
    }
  }

  // Waits for page to be loaded. Timeout could differ depending on usage.
  waitForPageDisplayed(timeout?: number): void {
    browser.waitUntil(
      () => {
        return this.isPageLoaded();
      },
      {
        timeout: timeout ?? this.waitForPageTimeout,
        timeoutMsg: this._pageName + ' did not render correctly. Please see /errorShots of the first failed test for more information.',
        interval: 1000,
      },
    );
  }

  waitForButtonDisplayed(timeout?: number): void {
    browser.waitUntil(
      () => {
        return this.isButtonInView();
      },
      {
        timeout: timeout ?? this.waitForPageTimeout,
        timeoutMsg: this._pageName + ' did not render correctly. Please see /errorShots of the first failed test for more information.',
        interval: 1000,
      },
    );
  }

  // Actual element on page
  get _testPage(): WebdriverIO.Element {
    return By(DUMMY_CHAR);
  }

  // Title of page
  get _pageName(): string {
    return DUMMY_CHAR;
  }

  // The button to select the page
  get _pageButton(): WebdriverIO.Element {
    return By(DUMMY_CHAR);
  }

  // Default timeout to wait until page is displayed (10s)
  private waitForPageTimeout: number = 15000;
}
