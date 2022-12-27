import { HOMEPAGE_ACTIVITY_INDICATOR_BUTTON } from '../ActivityIndicator/consts';
import { HOMEPAGE_AVATAR_BUTTON } from '../Avatar/consts';
import { HOMEPAGE_BADGE_BUTTON } from '../Badge/consts';
import { HOMEPAGE_CHECKBOX_BUTTON } from '../Checkbox/consts';
import { HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON } from '../CheckboxExperimental/consts';
import { HOMEPAGE_CORNERRADIUS_BUTTON } from '../CornerRadiusTokens/consts';
import { HOMEPAGE_BUTTON_BUTTON } from '../Button/consts';
import { HOMEPAGE_CALLOUT_BUTTON } from '../Callout/consts';
import { HOMEPAGE_CONTEXTUALMENU_BUTTON } from '../ContextualMenu/consts';
import { HOMEPAGE_EXPERIMENTAL_TABS_BUTTON } from '../TabsExperimental/consts';
import { HOMEPAGE_FOCUSTRAPZONE_BUTTON } from '../FocusTrapZone/consts';
import { HOMEPAGE_FOCUSZONE_BUTTON } from '../FocusZone/consts';
import { HOMEPAGE_ICON_BUTTON } from '../Icon/consts';
import { HOMEPAGE_LINK_BUTTON } from '../Link/consts';
import { HOMEPAGE_EXPERIMENTAL_LINK_BUTTON } from '../LinkExperimental/consts';
import { HOMEPAGE_MENU_BUTTON } from '../Menu/consts';
import { HOMEPAGE_MENUBUTTON_BUTTON } from '../MenuButton/consts';
import { HOMEPAGE_EXPERIMENTAL_MENU_BUTTON } from '../MenuButtonExperimental/consts';
import { HOMEPAGE_PERSONA_BUTTON } from '../Persona/consts';
import { HOMEPAGE_PERSONACOIN_BUTTON } from '../PersonaCoin/consts';
import { HOMEPAGE_PRESSABLE_BUTTON } from '../Pressable/consts';
import { HOMEPAGE_RADIOGROUP_BUTTON } from '../RadioGroup/consts';
import { HOMEPAGE_RADIO_GROUP_EXPERIMENTAL_BUTTON } from '../RadioGroupExperimental/consts';
import { HOMEPAGE_SEPARATOR_BUTTON } from '../Separator/consts';
import { HOMEPAGE_SHADOW_BUTTON } from '../Shadow/consts';
import { HOMEPAGE_SHIMMER_BUTTON } from '../Shimmer/consts';
import { HOMEPAGE_SPACING_BUTTON } from '../Spacing/consts';
import { HOMEPAGE_STROKEWIDTH_BUTTON } from '../StrokeWidthTokens/consts';
import { HOMEPAGE_SVG_BUTTON } from '../Svg/consts';
import { HOMEPAGE_SWITCH_BUTTON } from '../Switch/consts';
import { HOMEPAGE_TEXT_BUTTON } from '../Text/consts';
import { HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON } from '../TextExperimental/consts';
import { HOMEPAGE_TOKEN_BUTTON } from '../Tokens/consts';
import { HOMEPAGE_TABS_BUTTON } from '../Tabs/consts';
import { HOMEPAGE_THEME_BUTTON } from '../Theme/consts';
import { BASE_TESTPAGE } from './consts';
import { By, BasePage } from './BasePage';

class NavigateAppPage extends BasePage {
  async clickAndGoToActivityIndicatorPage() {
    await (await this.activityIndicatorPage).click();
  }

  async clickAndGoToAvatarPage() {
    await (await this.avatarPage).click();
  }

  async clickAndGoToBadgePage() {
    await (await this.badgePage).click();
  }

  async clickAndGoToButtonPage() {
    await (await this.buttonPage).click();
  }

  async clickAndGoToCalloutPage() {
    await (await this.calloutPage).click();
  }

  async clickAndGoToCheckboxPage() {
    await (await this.checkboxPage).click();
  }

  async clickAndGoToCheckboxExperimentalPage() {
    await (await this.checkboxExperimentalPage).click();
  }

  async clickAndGoToContextualMenuPage() {
    await (await this.contextualMenuPage).click();
  }

  async clickAndGoToCornerRadiusTokensPage() {
    await (await this.cornerRadiusTokensPage).click();
  }

  async clickAndGoToFocusTrapZonePage() {
    await (await this.focusTrapZonePage).click();
  }

  async clickAndGoToFocusZonePage() {
    await (await this.focusZonePage).click();
  }

  async clickAndGoToIconPage() {
    await (await this.iconPage).click();
  }

  async clickAndGoToLinkPage() {
    await (await this.linkPage).click();
  }

  async clickAndGoToLinkExperimentalPage() {
    await (await this.linkExperimentalPage).click();
  }

  async clickAndGoToMenuPage() {
    await (await this.menuPage).click();
  }

  async clickAndGoToMenuButtonPage() {
    await (await this.menuButtonPage).click();
  }

  async clickAndGoToExperimentalMenuButtonPage() {
    await (await this.menuButtonExperimentalPage).click();
  }

  async clickAndGoToPersonaPage() {
    await (await this.personaPage).click();
  }

  async clickAndGoToPersonaCoinPage() {
    await (await this.personaCoinPage).click();
  }

  async clickAndGoToPressablePage() {
    await (await this.pressablePage).click();
  }

  async clickAndGoToRadioGroupPage() {
    await (await this.radioGroupPage).click();
  }

  async clickAndGoToRadioGroupExperimentalPage() {
    await (await this.radioGroupExperimentalPage).click();
  }

  async clickAndGoToSeparatorPage() {
    await (await this.separatorPage).click();
  }

  async clickAndGoToShadowPage() {
    await (await this.shadowPage).click();
  }

  async clickAndGoToShimmerPage() {
    await (await this.shimmerPage).click();
  }

  async clickAndGoToSpacingTokensPage() {
    await (await this.spacingTokensPage).click();
  }

  async clickAndGoToStrokeWidthTokensPage() {
    await (await this.strokeWidthTokensPage).click();
  }

  async clickAndGoToSvgPage() {
    await (await this.svgPage).click();
  }

  async clickAndGoToSwitchPage() {
    await (await this.switchPage).click();
  }

  async clickAndGoToTextPage() {
    await (await this.textPage).click();
  }

  async clickAndGoToExperimentalTextPage() {
    await (await this.textExperimentalPage).click();
  }

  async clickAndGoToTabsPage() {
    await (await this.tabsPage).click();
  }

  async clickAndGoToThemePage() {
    await (await this.themePage).click();
  }

  async clickAndGoToTokensPage() {
    await (await this.tokensPage).click();
  }

  async clickAndGoToExperimentalTabsPage() {
    await (await this.experimentalTabsPage).click();
  }

  /*
   ** Returns the StealthButton element on the left-hand column that navigates to each page
   */

  get _testPage() {
    return By(BASE_TESTPAGE);
  }

  private get activityIndicatorPage() {
    return By(HOMEPAGE_ACTIVITY_INDICATOR_BUTTON);
  }

  private get avatarPage() {
    return By(HOMEPAGE_AVATAR_BUTTON);
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

  private get checkboxExperimentalPage() {
    return By(HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON);
  }

  private get contextualMenuPage() {
    return By(HOMEPAGE_CONTEXTUALMENU_BUTTON);
  }

  private get cornerRadiusTokensPage() {
    return By(HOMEPAGE_CORNERRADIUS_BUTTON);
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

  private get linkExperimentalPage() {
    return By(HOMEPAGE_EXPERIMENTAL_LINK_BUTTON);
  }

  private get menuPage() {
    return By(HOMEPAGE_MENU_BUTTON);
  }

  private get menuButtonPage() {
    return By(HOMEPAGE_MENUBUTTON_BUTTON);
  }

  private get menuButtonExperimentalPage() {
    return By(HOMEPAGE_EXPERIMENTAL_MENU_BUTTON);
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

  private get radioGroupExperimentalPage() {
    return By(HOMEPAGE_RADIO_GROUP_EXPERIMENTAL_BUTTON);
  }

  private get separatorPage() {
    return By(HOMEPAGE_SEPARATOR_BUTTON);
  }

  private get shadowPage() {
    return By(HOMEPAGE_SHADOW_BUTTON);
  }

  private get shimmerPage() {
    return By(HOMEPAGE_SHIMMER_BUTTON);
  }

  private get strokeWidthTokensPage() {
    return By(HOMEPAGE_STROKEWIDTH_BUTTON);
  }

  private get spacingTokensPage() {
    return By(HOMEPAGE_SPACING_BUTTON);
  }

  private get svgPage() {
    return By(HOMEPAGE_SVG_BUTTON);
  }

  private get switchPage() {
    return By(HOMEPAGE_SWITCH_BUTTON);
  }

  private get textPage() {
    return By(HOMEPAGE_TEXT_BUTTON);
  }

  private get textExperimentalPage() {
    return By(HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON);
  }

  private get tabsPage() {
    return By(HOMEPAGE_TABS_BUTTON);
  }

  private get themePage() {
    return By(HOMEPAGE_THEME_BUTTON);
  }

  private get tokensPage() {
    return By(HOMEPAGE_TOKEN_BUTTON);
  }

  private get experimentalTabsPage() {
    return By(HOMEPAGE_EXPERIMENTAL_TABS_BUTTON);
  }

  get _pageName() {
    // This is the main page displayed after launching the fluent tester.
    return 'The Fluent Tester Base Page';
  }

  get _pageButton(): Promise<WebdriverIO.Element> {
    throw new Error('You are trying to read the _pageButton getter for NavigateAppPage, which is not implemented.');
  }
}

export default new NavigateAppPage();
