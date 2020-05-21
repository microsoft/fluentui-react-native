const DUMMY_CHAR = '';

export function By(testId: string): WebdriverIO.Element {
  return $('~' + testId);
}

export class BasePage {
  isPageLoaded(): boolean {
    return this._testPage.isDisplayed();
  }

  get _testPage() {
    return By(DUMMY_CHAR);
  }
}
