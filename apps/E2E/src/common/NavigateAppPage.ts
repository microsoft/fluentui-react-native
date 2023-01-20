import { HOMEPAGE_ACTIVITY_INDICATOR_BUTTON } from '../ActivityIndicator/consts';
import { HOMEPAGE_AVATAR_BUTTON } from '../Avatar/consts';
import { HOMEPAGE_BADGE_BUTTON } from '../Badge/consts';
import { HOMEPAGE_CHECKBOX_BUTTON } from '../CheckboxLegacy/consts';
import { HOMEPAGE_CHECKBOXV1_BUTTON } from '../CheckboxV1/consts';
import { HOMEPAGE_CORNERRADIUS_BUTTON } from '../CornerRadiusTokens/consts';
import { HOMEPAGE_BUTTON_BUTTON } from '../ButtonLegacy/consts';
import { HOMEPAGE_CALLOUT_BUTTON } from '../Callout/consts';
import { HOMEPAGE_CONTEXTUALMENU_BUTTON } from '../ContextualMenu/consts';
import { HOMEPAGE_TABSV1_BUTTON } from '../TabsV1/consts';
import { HOMEPAGE_FOCUSTRAPZONE_BUTTON } from '../FocusTrapZone/consts';
import { HOMEPAGE_FOCUSZONE_BUTTON } from '../FocusZone/consts';
import { HOMEPAGE_ICON_BUTTON } from '../IconLegacy/consts';
import { HOMEPAGE_LINK_BUTTON } from '../LinkLegacy/consts';
import { HOMEPAGE_LINKV1_BUTTON } from '../LinkV1/consts';
import { HOMEPAGE_MENU_BUTTON } from '../Menu/consts';
import { HOMEPAGE_MENUBUTTON_BUTTON } from '../MenuButtonLegacy/consts';
import { HOMEPAGE_MENUBUTTONV1_BUTTON } from '../MenuButtonV1/consts';
import { HOMEPAGE_PERSONA_BUTTON } from '../Persona/consts';
import { HOMEPAGE_PERSONACOIN_BUTTON } from '../PersonaCoin/consts';
import { HOMEPAGE_PRESSABLE_BUTTON } from '../Pressable/consts';
import { HOMEPAGE_RADIOGROUP_BUTTON } from '../RadioGroupLegacy/consts';
import { HOMEPAGE_RADIOGROUPV1_BUTTON } from '../RadioGroupV1/consts';
import { HOMEPAGE_SEPARATOR_BUTTON } from '../Separator/consts';
import { HOMEPAGE_SHADOW_BUTTON } from '../Shadow/consts';
import { HOMEPAGE_SHIMMER_BUTTON } from '../Shimmer/consts';
import { HOMEPAGE_SPACING_BUTTON } from '../Spacing/consts';
import { HOMEPAGE_STROKEWIDTH_BUTTON } from '../StrokeWidthTokens/consts';
import { HOMEPAGE_SVG_BUTTON } from '../Svg/consts';
import { HOMEPAGE_SWITCH_BUTTON } from '../Switch/consts';
import { HOMEPAGE_TEXT_BUTTON } from '../TextLegacy/consts';
import { HOMEPAGE_TEXTV1_BUTTON } from '../TextV1/consts';
import { HOMEPAGE_TOKEN_BUTTON } from '../Tokens/consts';
import { HOMEPAGE_TABS_BUTTON } from '../TabsLegacy/consts';
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

  async clickAndGoToCheckboxLegacyPage() {
    await (await this.checkboxLegacyPage).click();
  }

  async clickAndGoToCheckboxV1Page() {
    await (await this.checkboxV1Page).click();
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

  async clickAndGoToLinkLegacyPage() {
    await (await this.linkLegacyPage).click();
  }

  async clickAndGoToLinkV1Page() {
    await (await this.linkV1Page).click();
  }

  async clickAndGoToMenuPage() {
    await (await this.menuPage).click();
  }

  async clickAndGoToMenuButtonLegacyPage() {
    await (await this.menuButtonLegacyPage).click();
  }

  async clickAndGoToMenuButtonV1Page() {
    await (await this.menuButtonV1Page).click();
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

  async clickAndGoToRadioGroupLegacyPage() {
    await (await this.radioGroupLegacyPage).click();
  }

  async clickAndGoToRadioGroupV1Page() {
    await (await this.radioGroupV1Page).click();
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

  async clickAndGoToTextLegacyPage() {
    await (await this.textLegacyPage).click();
  }

  async clickAndGoToTextV1Page() {
    await (await this.textV1Page).click();
  }

  async clickAndGoToTabsLegacyPage() {
    await (await this.tabsLegacyPage).click();
  }

  async clickAndGoToThemePage() {
    await (await this.themePage).click();
  }

  async clickAndGoToTokensPage() {
    await (await this.tokensPage).click();
  }

  async clickAndGoToTabsV1Page() {
    await (await this.tabsV1Page).click();
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

  private get checkboxLegacyPage() {
    return By(HOMEPAGE_CHECKBOX_BUTTON);
  }

  private get checkboxV1Page() {
    return By(HOMEPAGE_CHECKBOXV1_BUTTON);
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

  private get linkLegacyPage() {
    return By(HOMEPAGE_LINK_BUTTON);
  }

  private get linkV1Page() {
    return By(HOMEPAGE_LINKV1_BUTTON);
  }

  private get menuPage() {
    return By(HOMEPAGE_MENU_BUTTON);
  }

  private get menuButtonLegacyPage() {
    return By(HOMEPAGE_MENUBUTTON_BUTTON);
  }

  private get menuButtonV1Page() {
    return By(HOMEPAGE_MENUBUTTONV1_BUTTON);
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

  private get radioGroupLegacyPage() {
    return By(HOMEPAGE_RADIOGROUP_BUTTON);
  }

  private get radioGroupV1Page() {
    return By(HOMEPAGE_RADIOGROUPV1_BUTTON);
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

  private get textLegacyPage() {
    return By(HOMEPAGE_TEXT_BUTTON);
  }

  private get textV1Page() {
    return By(HOMEPAGE_TEXTV1_BUTTON);
  }

  private get tabsLegacyPage() {
    return By(HOMEPAGE_TABS_BUTTON);
  }

  private get themePage() {
    return By(HOMEPAGE_THEME_BUTTON);
  }

  private get tokensPage() {
    return By(HOMEPAGE_TOKEN_BUTTON);
  }

  private get tabsV1Page() {
    return By(HOMEPAGE_TABSV1_BUTTON);
  }

  get _pageName() {
    // This is the main page displayed after launching the fluent tester.
    return 'The Fluent Tester Base Page';
  }

  get _pageButton(): Promise<WebdriverIO.Element> {
    throw new Error('You are trying to read the _pageButton getter for NavigateAppPage, which is not implemented.');
  }

  get _pageButtonName(): string {
    throw new Error('You are trying to read the _pageButtonName getter for NavigateAppPage, which is not implemented.');
  }
}

export default new NavigateAppPage();
