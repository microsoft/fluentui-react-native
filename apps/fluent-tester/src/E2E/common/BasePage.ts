const DUMMY_CHAR = '';

export function By(testId: string): WebdriverIO.Element {
  return $('~' + testId);
}

export class BasePage {
  isPageLoaded(): boolean {
    return this._testPage.isDisplayed();
  }

  // Waits for page to be loaded. Timeout could differ depending on usage.
  waitForPageLoaded(timeout?: number) {
    browser.waitUntil(
      () => {
        return this.isPageLoaded();
      },
      timeout,
      'Timeout Error - The page was not loaded in time.'
    );
  }

  get _testPage() {
    return By(DUMMY_CHAR);
  }
}
