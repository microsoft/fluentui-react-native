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
    this._testPage.waitForDisplayed(timeout ?? this.waitForPageTimeout, false, 'ERROR: ' + this._pageName + ' was never displayed. Please visit /errorShots for more information.');
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
