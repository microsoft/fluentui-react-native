class LinkTestPage {
  isPageLoaded(): boolean {
    return this._linkPage.isDisplayed();
  }

  get _linkPage() {
    return $('~LinkTestPage');
  }
}

export default new LinkTestPage();
