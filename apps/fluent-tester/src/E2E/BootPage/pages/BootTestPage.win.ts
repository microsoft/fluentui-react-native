import { HOMEPAGE_CHECKBOX_BUTTON } from '../../../FluentTester/TestComponents/Checkbox/consts';
import { HOMEPAGE_BUTTON_BUTTON } from '../../../FluentTester/TestComponents/Button/consts';
import { HOMEPAGE_CALLOUT_BUTTON } from '../../../FluentTester/TestComponents/Callout/consts';
import { HOMEPAGE_CONTEXTUALMENU_BUTTON } from '../../../FluentTester/TestComponents/ContextualMenu/consts';
import { HOMEPAGE_FOCUSTRAPZONE_BUTTON } from '../../../FluentTester/TestComponents/FocusTrapZone/consts';
import { HOMEPAGE_FOCUSZONE_BUTTON } from '../../../FluentTester/TestComponents/FocusZone/consts';
import { HOMEPAGE_ICON_BUTTON } from '../../../FluentTester/TestComponents/Icon/consts';
import { HOMEPAGE_LINK_BUTTON } from '../../../FluentTester/TestComponents/Link/consts';
import { HOMEPAGE_PERSONA_BUTTON } from '../../../FluentTester/TestComponents/Persona/consts';
import { HOMEPAGE_PERSONACOIN_BUTTON } from '../../../FluentTester/TestComponents/PersonaCoin/consts';
import { HOMEPAGE_PRESSABLE_BUTTON } from '../../../FluentTester/TestComponents/Pressable/consts';
import { HOMEPAGE_RADIOGROUP_BUTTON } from '../../../FluentTester/TestComponents/RadioGroup/consts';
import { HOMEPAGE_SEPARATOR_BUTTON } from '../../../FluentTester/TestComponents/Separator/consts';
import { HOMEPAGE_SVG_BUTTON } from '../../../FluentTester/TestComponents/Svg/consts';
import { HOMEPAGE_TEXT_BUTTON } from '../../../FluentTester/TestComponents/Text/consts';
import { HOMEPAGE_TABS_BUTTON } from '../../../FluentTester/TestComponents/Tabs/consts';
import { HOMEPAGE_THEME_BUTTON } from '../../../FluentTester/TestComponents/Theme/consts';
import { BASE_TESTPAGE } from '../../../FluentTester/TestComponents/Common/consts';
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

  clickAndGoToContextualMenuPage() {
    this.contextualMenuPage.click();
  }

  clickAndGoToFocusTrapZonePage() {
    this.focusTrapZonePage.click();
  }

  clickAndGoToFocusZonePage() {
    this.focusZonePage.click();
  }

  clickAndGoToIconPage() {
    this.iconPage.click();
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

  clickAndGoToTabsPage() {
    this.tabsPage.click();
  }

  clickAndGoToThemePage() {
    this.themePage.click();
  }

  /*
   ** Returns the StealthButton element on the left-hand column that navigates to each page
   */

  get _testPage() {
    return By(BASE_TESTPAGE);
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

  private get contextualMenuPage() {
    return By(HOMEPAGE_CONTEXTUALMENU_BUTTON);
  }

  private get focusTrapZonePage() {
    return By(HOMEPAGE_FOCUSTRAPZONE_BUTTON);
  }

  private get focusZonePage() {
    return By(HOMEPAGE_FOCUSZONE_BUTTON);
  }

  private get iconPage() {
    return By(HOMEPAGE_ICON_BUTTON);
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

  private get tabsPage() {
    return By(HOMEPAGE_TABS_BUTTON);
  }

  private get themePage() {
    return By(HOMEPAGE_THEME_BUTTON);
  }
}

export default new BootTestPage();
