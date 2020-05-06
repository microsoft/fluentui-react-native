class ButtonTestPage {
  isPageLoaded(): boolean {
    return this._buttonPage.isDisplayed();
  }

  get _buttonPage() {
    return $('~ButtonTestPage');
  }
}

export default new ButtonTestPage();
