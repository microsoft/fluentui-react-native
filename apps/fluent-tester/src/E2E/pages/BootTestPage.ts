class BootTestPage {
  clickAndGoToButtonPage() {
    this.buttonPage.click();
  }

  clickAndGoToCalloutPage() {
    this.calloutPage.click();
  }

  clickAndGoToCheckboxPage() {
    this.checkboxPage.click();
  }

  clickAndGoToFocusTrapZonePage() {
    this.focusTrapZonePage.click();
  }

  clickAndGoToLinkPage() {
    this.linkPage.click();
  }

  clickAndGoToPersonaPage() {
    this.personaPage.click();
  }

  clickAndGoToPersonaCoinPage() {
    this.personaCoinPage.click();
  }

  clickAndGoToPressablePage() {
    this.pressablePage.click();
  }

  clickAndGoToRadioGroupPage() {
    this.radioGroupPage.click();
  }

  clickAndGoToSeparatorPage() {
    this.separatorPage.click();
  }

  clickAndGoToThemePage() {
    this.themePage.click();
  }

  private get buttonPage() {
    return $('~Button Test');
  }

  private get calloutPage() {
    return $('~Callout Test');
  }

  private get checkboxPage() {
    return $('~Checkbox Test');
  }

  private get focusTrapZonePage() {
    return $('~Focus Trap Zone Test');
  }

  private get linkPage() {
    return $('~Link Test');
  }

  private get personaPage() {
    return $('~Persona Test');
  }

  private get personaCoinPage() {
    return $('~Persona Coin Test');
  }

  private get pressablePage() {
    return $('~Pressable Test');
  }

  private get radioGroupPage() {
    return $('~RadioGroup Test');
  }

  private get separatorPage() {
    return $('~Separator Test');
  }

  private get themePage() {
    return $('~Theme Test');
  }
}

export default new BootTestPage();
