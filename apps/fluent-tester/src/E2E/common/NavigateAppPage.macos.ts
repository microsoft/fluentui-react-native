import { HOMEPAGE_CHECKBOX_BUTTON } from '../../TestComponents/Checkbox/consts';
import { HOMEPAGE_BADGE_BUTTON } from '../../TestComponents/Badge/consts';
import { HOMEPAGE_BUTTON_BUTTON } from '../../TestComponents/Button/consts';
import { HOMEPAGE_CALLOUT_BUTTON } from '../../TestComponents/Callout/consts';
import { HOMEPAGE_CONTEXTUALMENU_BUTTON } from '../../TestComponents/ContextualMenu/consts';
import { HOMEPAGE_EXPERIMENTAL_TABS_BUTTON } from '../../TestComponents/TabsExperimental/consts';
import { HOMEPAGE_FOCUSTRAPZONE_BUTTON } from '../../TestComponents/FocusTrapZone/consts';
import { HOMEPAGE_FOCUSZONE_BUTTON } from '../../TestComponents/FocusZone/consts';
import { HOMEPAGE_ICON_BUTTON } from '../../TestComponents/Icon/consts';
import { HOMEPAGE_LINK_BUTTON } from '../../TestComponents/Link/consts';
import { HOMEPAGE_MENUBUTTON_BUTTON } from '../../TestComponents/MenuButton/consts';
import { HOMEPAGE_PERSONA_BUTTON } from '../../TestComponents/Persona/consts';
import { HOMEPAGE_PERSONACOIN_BUTTON } from '../../TestComponents/PersonaCoin/consts';
import { HOMEPAGE_PRESSABLE_BUTTON } from '../../TestComponents/Pressable/consts';
import { HOMEPAGE_RADIOGROUP_BUTTON } from '../../TestComponents/RadioGroup/consts';
import { HOMEPAGE_SEPARATOR_BUTTON } from '../../TestComponents/Separator/consts';
import { HOMEPAGE_SVG_BUTTON } from '../../TestComponents/Svg/consts';
import { HOMEPAGE_TEXT_BUTTON } from '../../TestComponents/Text/consts';
import { HOMEPAGE_TABS_BUTTON } from '../../TestComponents/Tabs/consts';
import { HOMEPAGE_THEME_BUTTON } from '../../TestComponents/Theme/consts';
import { BASE_TESTPAGE } from '../../TestComponents/Common/consts';
import { By, BasePage } from './BasePage.macos';

class NavigateAppPage extends BasePage {
  async clickAndGoToBadgePage() {
    await this.badgePage.then((badgePage) => badgePage.click());
  }

  async clickAndGoToButtonPage() {
    await this.buttonPage.then((buttonPage) => buttonPage.click());
  }

  async clickAndGoToCalloutPage() {
    await this.calloutPage.then((calloutPage) => calloutPage.click());
  }

  async clickAndGoToCheckboxPage() {
    await this.checkboxPage.then((checkboxPage) => checkboxPage.click());
  }

  async clickAndGoToContextualMenuPage() {
    await this.contextualMenuPage.then((contextualMenuPage) => contextualMenuPage.click());
  }

  async clickAndGoToFocusTrapZonePage() {
    await this.focusTrapZonePage.then((focusTrapZonePage) => focusTrapZonePage.click());
  }

  async clickAndGoToFocusZonePage() {
    await this.focusZonePage.then((focusZonePage) => focusZonePage.click());
  }

  async clickAndGoToIconPage() {
    await this.iconPage.then((iconPage) => iconPage.click());
  }

  async clickAndGoToLinkPage() {
    await this.linkPage.then((linkPage) => linkPage.click());
  }

  async clickAndGoToMenuButtonPage() {
    await this.menuButtonPage.then((menuButtonPage) => menuButtonPage.click());
  }

  async clickAndGoToPersonaPage() {
    await this.personaPage.then((personaPage) => personaPage.click());
  }

  async clickAndGoToPersonaCoinPage() {
    await this.personaCoinPage.then((personaCoinPage) => personaCoinPage.click());
  }

  async clickAndGoToPressablePage() {
    await this.pressablePage.then((pressablePage) => pressablePage.click());
  }

  async clickAndGoToRadioGroupPage() {
    await this.radioGroupPage.then((radioGroupPage) => radioGroupPage.click());
  }

  async clickAndGoToSeparatorPage() {
    await this.separatorPage.then((separatorPage) => separatorPage.click());
  }

  async clickAndGoToSvgPage() {
    await this.svgPage.then((svgPage) => svgPage.click());
  }

  async clickAndGoToTextPage() {
    await this.textPage.then((textPage) => textPage.click());
  }

  async clickAndGoToTabsPage() {
    await this.tabsPage.then((tabsPage) => tabsPage.click());
  }

  async clickAndGoToThemePage() {
    await this.themePage.then((themePage) => themePage.click());
  }

  async clickAndGoToExperimentalTabsPage() {
    await this.experimentalTabsPage.then((experimentalTabsPage) => experimentalTabsPage.click());
  }

  /*
   ** Returns the StealthButton element on the left-hand column that navigates to each page
   */

  get _testPage() {
    return By(BASE_TESTPAGE);
  }

  private get badgePage() {
    return By(HOMEPAGE_BADGE_BUTTON);
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

  private get menuButtonPage() {
    return By(HOMEPAGE_MENUBUTTON_BUTTON);
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

  private get experimentalTabsPage() {
    return By(HOMEPAGE_EXPERIMENTAL_TABS_BUTTON);
  }
}

export default new NavigateAppPage();
