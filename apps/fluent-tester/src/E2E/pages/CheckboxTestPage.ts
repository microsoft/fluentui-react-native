class CheckboxTestPage {
  isPageLoaded(): boolean {
    return this._checkboxPage.isDisplayed();
  }
  get _checkboxPage() {
    return $('~CheckboxTestPage');
  }
}

export default new CheckboxTestPage();
