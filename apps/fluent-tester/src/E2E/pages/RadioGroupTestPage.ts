class RadioGroupPage {
  isPageLoaded(): boolean {
    return this._radioGroupPage.isDisplayed();
  }

  get _radioGroupPage() {
    return $('~RadioGroupTestPage');
  }
}

export default new RadioGroupPage();
