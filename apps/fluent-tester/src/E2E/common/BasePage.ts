const DUMMY_CHAR = '';

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

  scrollToButton(): void {
    while (!this.isButtonInView()) {
      driver.touchScroll(0, -75, $('~SCROLLVIEW_TEST_ID').elementId);
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
