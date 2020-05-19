//import { BASE_TESTPAGE } from '../../../RNTester/FabricTester';
import { HOMEPAGE_CHECKBOX_BUTTON } from '../../../RNTester/TestComponents/Checkbox/consts';
import { HOMEPAGE_BUTTON_BUTTON } from '../../../RNTester/TestComponents/Button/consts';
import { HOMEPAGE_CALLOUT_BUTTON } from '../../../RNTester/TestComponents/Callout/consts';
import { HOMEPAGE_FOCUSTRAPZONE_BUTTON } from '../../../RNTester/TestComponents/FocusTrapZone/consts';
import { HOMEPAGE_LINK_BUTTON } from '../../../RNTester/TestComponents/Link/consts';
import { HOMEPAGE_PERSONA_BUTTON } from '../../../RNTester/TestComponents/Persona/consts';
import { HOMEPAGE_PERSONACOIN_BUTTON } from '../../../RNTester/TestComponents/PersonaCoin/consts';
import { HOMEPAGE_PRESSABLE_BUTTON } from '../../../RNTester/TestComponents/Pressable/consts';
import { HOMEPAGE_RADIOGROUP_BUTTON } from '../../../RNTester/TestComponents/RadioGroup/consts';
import { HOMEPAGE_SEPARATOR_BUTTON } from '../../../RNTester/TestComponents/Separator/consts';
import { HOMEPAGE_SVG_BUTTON } from '../../../RNTester/TestComponents/Svg/consts';
import { HOMEPAGE_TEXT_BUTTON } from '../../../RNTester/TestComponents/Text/consts';
import { HOMEPAGE_THEME_BUTTON } from '../../../RNTester/TestComponents/Theme/consts';
import { By, BasePage } from '../../common/BasePage';

class BootTestPage extends BasePage {
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

  get _testPage() {
    return By('Base_TestPage');
  }

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
