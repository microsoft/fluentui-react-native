const DUMMY_CHAR = '';

export function By(testId: string): WebdriverIO.Element {
  return $('~' + testId);
}

export class BasePage {
  isPageLoaded(): boolean {
    return this._testPage.isDisplayed();
  }

  // Waits for page to be loaded. Timeout could differ depending on usage.
  waitForPageDisplayed(timeout?: number) {
    browser.waitUntil(
      () => {
        return this.isPageLoaded();
      },
      timeout ?? this.waitForPageTimeout,
      this._pageName + ' did not render correctly. Please see /errorShots of the first failed test for more information.',
      1000
    );
  }

  // Actual element on page
  get _testPage() {
    return By(DUMMY_CHAR);
  }

  // Title of page
  get _pageName() {
    return DUMMY_CHAR;
  }

  // Default timeout to wait until page is displayed (10s)
  private waitForPageTimeout: number = 10000;
}