import { HOMEPAGE_ACTIVITY_INDICATOR_BUTTON } from '../../TestComponents/ActivityIndicator/consts';
import { HOMEPAGE_AVATAR_BUTTON } from '../../TestComponents/Avatar/consts';
import { HOMEPAGE_BADGE_BUTTON } from '../../TestComponents/Badge/consts';
import { HOMEPAGE_CHECKBOX_BUTTON } from '../../TestComponents/Checkbox/consts';
import { HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON } from '../../TestComponents/CheckboxExperimental/consts';
import { HOMEPAGE_BUTTON_BUTTON } from '../../TestComponents/Button/consts';
import { HOMEPAGE_CALLOUT_BUTTON } from '../../TestComponents/Callout/consts';
import { HOMEPAGE_CONTEXTUALMENU_BUTTON } from '../../TestComponents/ContextualMenu/consts';
import { HOMEPAGE_EXPERIMENTAL_TABS_BUTTON } from '../../TestComponents/TabsExperimental/consts';
import { HOMEPAGE_FOCUSTRAPZONE_BUTTON } from '../../TestComponents/FocusTrapZone/consts';
import { HOMEPAGE_FOCUSZONE_BUTTON } from '../../TestComponents/FocusZone/consts';
import { HOMEPAGE_ICON_BUTTON } from '../../TestComponents/Icon/consts';
import { HOMEPAGE_LINK_BUTTON } from '../../TestComponents/Link/consts';
import { HOMEPAGE_MENU_BUTTON } from '../../TestComponents/Menu/consts';
import { HOMEPAGE_MENUBUTTON_BUTTON } from '../../TestComponents/MenuButton/consts';
import { HOMEPAGE_EXPERIMENTAL_MENU_BUTTON } from '../../TestComponents/MenuButtonExperimental/consts';
import { HOMEPAGE_PERSONA_BUTTON } from '../../TestComponents/Persona/consts';
import { HOMEPAGE_PERSONACOIN_BUTTON } from '../../TestComponents/PersonaCoin/consts';
import { HOMEPAGE_PRESSABLE_BUTTON } from '../../TestComponents/Pressable/consts';
import { HOMEPAGE_RADIOGROUP_BUTTON } from '../../TestComponents/RadioGroup/consts';
import { HOMEPAGE_SEPARATOR_BUTTON } from '../../TestComponents/Separator/consts';
import { HOMEPAGE_SHIMMER_BUTTON } from '../../TestComponents/Shimmer/consts';
import { HOMEPAGE_SVG_BUTTON } from '../../TestComponents/Svg/consts';
import { HOMEPAGE_SWITCH_BUTTON } from '../../TestComponents/Switch/consts';
import { HOMEPAGE_TEXT_BUTTON } from '../../TestComponents/Text/consts';
import { HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON } from '../../TestComponents/TextExperimental/consts';
import { HOMEPAGE_TOKEN_BUTTON } from '../../TestComponents/Tokens/consts';
import { HOMEPAGE_TABS_BUTTON } from '../../TestComponents/Tabs/consts';
import { HOMEPAGE_THEME_BUTTON } from '../../TestComponents/Theme/consts';
import { BASE_TESTPAGE } from '../../TestComponents/Common/consts';
import { By, BasePage } from './BasePage.win';

class NavigateAppPage extends BasePage {
  async clickAndGoToActivityIndicatorPage() {
    const activityIndicatorPage = await By(HOMEPAGE_ACTIVITY_INDICATOR_BUTTON);
    await activityIndicatorPage.click();
  }

  async clickAndGoToAvatarPage() {
    const avatarPage = await By(HOMEPAGE_AVATAR_BUTTON);
    await avatarPage.click();
  }

  async clickAndGoToBadgePage() {
    const badgePage = await By(HOMEPAGE_BADGE_BUTTON);
    await badgePage.click();
  }

  async clickAndGoToButtonPage() {
    const buttonPage = await By(HOMEPAGE_BUTTON_BUTTON);
    await buttonPage.click();
  }

  async clickAndGoToCalloutPage() {
    const calloutPage = await By(HOMEPAGE_CALLOUT_BUTTON);
    await calloutPage.click();
  }

  async clickAndGoToCheckboxPage() {
    const checkboxPage = await By(HOMEPAGE_CHECKBOX_BUTTON);
    await checkboxPage.click();
  }

  async clickAndGoToCheckboxExperimentalPage() {
    const checkboxExperimentalPage = await By(HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON);
    await checkboxExperimentalPage.click();
  }

  async clickAndGoToContextualMenuPage() {
    const contextualMenuPage = await By(HOMEPAGE_CONTEXTUALMENU_BUTTON);
    await contextualMenuPage.click();
  }

  async clickAndGoToFocusTrapZonePage() {
    const focusTrapZonePage = await By(HOMEPAGE_FOCUSTRAPZONE_BUTTON);
    await focusTrapZonePage.click();
  }

  async clickAndGoToFocusZonePage() {
    const focusZonePage = await By(HOMEPAGE_FOCUSZONE_BUTTON);
    await focusZonePage.click();
  }

  async clickAndGoToIconPage() {
    const iconPage = await By(HOMEPAGE_ICON_BUTTON);
    await iconPage.click();
  }

  async clickAndGoToLinkPage() {
    const linkPage = await By(HOMEPAGE_LINK_BUTTON);
    await linkPage.click();
  }

  async clickAndGoToMenuPage() {
    const menuPage = await By(HOMEPAGE_MENU_BUTTON);
    await menuPage.click();
  }

  async clickAndGoToMenuButtonPage() {
    const menuButtonPage = await By(HOMEPAGE_MENUBUTTON_BUTTON);
    await menuButtonPage.click();
  }

  async clickAndGoToExperimentalMenuButtonPage() {
    const menuButtonExperimentalPage = await By(HOMEPAGE_EXPERIMENTAL_MENU_BUTTON);
    await menuButtonExperimentalPage.click();
  }

  async clickAndGoToPersonaPage() {
    const personaPage = await By(HOMEPAGE_PERSONA_BUTTON);
    await personaPage.click();
  }

  async clickAndGoToPersonaCoinPage() {
    const personaCoinPage = await By(HOMEPAGE_PERSONACOIN_BUTTON);
    await personaCoinPage.click();
  }

  async clickAndGoToPressablePage() {
    const pressablePage = await By(HOMEPAGE_PRESSABLE_BUTTON);
    await pressablePage.click();
  }

  async clickAndGoToRadioGroupPage() {
    const radioGroupPage = await By(HOMEPAGE_RADIOGROUP_BUTTON);
    await radioGroupPage.click();
  }

  async clickAndGoToSeparatorPage() {
    const separatorPage = await By(HOMEPAGE_SEPARATOR_BUTTON);
    await separatorPage.click();
  }

  async clickAndGoToShimmerPage() {
    const shimmerPage = await By(HOMEPAGE_SHIMMER_BUTTON);
    await shimmerPage.click();
  }

  async clickAndGoToSvgPage() {
    const svgPage = await By(HOMEPAGE_SVG_BUTTON);
    await svgPage.click();
  }

  async clickAndGoToSwitchPage() {
    const switchPage = await By(HOMEPAGE_SWITCH_BUTTON);
    await switchPage.click();
  }

  async clickAndGoToTextPage() {
    const textPage = await By(HOMEPAGE_TEXT_BUTTON);
    await textPage.click();
  }

  async clickAndGoToExperimentalTextPage() {
    const textExperimentalPage = await By(HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON);
    await textExperimentalPage.click();
  }

  async clickAndGoToTabsPage() {
    const tabsPage = await By(HOMEPAGE_TABS_BUTTON);
    await tabsPage.click();
  }

  async clickAndGoToThemePage() {
    const themePage = await By(HOMEPAGE_THEME_BUTTON);
    await themePage.click();
  }

  async clickAndGoToTokensPage() {
    const tokensPage = await By(HOMEPAGE_TOKEN_BUTTON);
    await tokensPage.click();
  }

  async clickAndGoToExperimentalTabsPage() {
    const experimentalTabsPage = await By(HOMEPAGE_EXPERIMENTAL_TABS_BUTTON);
    await experimentalTabsPage.click();
  }

  /*
   ** Returns the StealthButton element on the left-hand column that navigates to each page
   */

  get _testPage() {
    return By(BASE_TESTPAGE);
  }
}

export default new NavigateAppPage();
