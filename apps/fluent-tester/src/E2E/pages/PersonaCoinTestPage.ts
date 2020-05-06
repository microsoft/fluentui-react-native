class PersonaCoinTestPage {
  isPageLoaded(): boolean {
    return this._personaCoinTestPage.isDisplayed();
  }

  get _personaCoinTestPage() {
    return $('~PersonaCoinTestPage');
  }
}

export default new PersonaCoinTestPage();
