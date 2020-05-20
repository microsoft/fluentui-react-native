import {
  HOMEPAGE_BUTTON_BUTTON,
  HOMEPAGE_CALLOUT_BUTTON,
  HOMEPAGE_CHECKBOX_BUTTON,
  HOMEPAGE_FOCUSTRAPZONE_BUTTON,
  HOMEPAGE_LINK_BUTTON,
  HOMEPAGE_PERSONA_BUTTON,
  HOMEPAGE_PERSONACOIN_BUTTON,
  HOMEPAGE_PRESSABLE_BUTTON,
  HOMEPAGE_RADIOGROUP_BUTTON,
  HOMEPAGE_SEPARATOR_BUTTON,
  HOMEPAGE_SVG_BUTTON,
  HOMEPAGE_TEXT_BUTTON,
  HOMEPAGE_THEME_BUTTON
} from '../../RNTester/Consts';
import { By } from './BasePage';

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

  clickAndGoToSvgPage() {
    this.svgPage.click();
  }

  clickAndGoToTextPage() {
    this.textPage.click();
  }

  clickAndGoToThemePage() {
    this.themePage.click();
  }

  /*
   ** Returns the StealthButton element on the left-hand column that navigates to each page
   */
  private get buttonPage() {
    return By(HOMEPAGE_BUTTON_BUTTON);
  }

  private get calloutPage() {
    return By(HOMEPAGE_CALLOUT_BUTTON);
  }

  private get checkboxPage() {
    return By(HOMEPAGE_CHECKBOX_BUTTON);
  }

  private get focusTrapZonePage() {
    return By(HOMEPAGE_FOCUSTRAPZONE_BUTTON);
  }

  private get linkPage() {
    return By(HOMEPAGE_LINK_BUTTON);
  }

  private get personaPage() {
    return By(HOMEPAGE_PERSONA_BUTTON);
  }

  private get personaCoinPage() {
    return By(HOMEPAGE_PERSONACOIN_BUTTON);
  }

  private get pressablePage() {
    return By(HOMEPAGE_PRESSABLE_BUTTON);
  }

  private get radioGroupPage() {
    return By(HOMEPAGE_RADIOGROUP_BUTTON);
  }

  private get separatorPage() {
    return By(HOMEPAGE_SEPARATOR_BUTTON);
  }

  private get svgPage() {
    return By(HOMEPAGE_SVG_BUTTON);
  }

  private get textPage() {
    return By(HOMEPAGE_TEXT_BUTTON);
  }

  private get themePage() {
    return By(HOMEPAGE_THEME_BUTTON);
  }
}

export default new BootTestPage();
