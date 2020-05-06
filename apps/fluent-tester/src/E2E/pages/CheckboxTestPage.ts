class CheckboxTestPage {
  isPageLoaded(): boolean {
    return this._calloutPage.isDisplayed();
  }

  get _calloutPage() {
    return $('~CheckboxTestPage');
  }
}

export default new CheckboxTestPage();
