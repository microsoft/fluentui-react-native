import ButtonTestPage from '../../Button/pages/ButtonTestPage.win';
import CalloutTestPage from '../../Callout/pages/CalloutTestPage.win';
import CheckboxTestPage from '../../Checkbox/pages/CheckboxTestPage.win';
import ContextualMenuTestPage from '../../ContextualMenu/pages/ContextualMenuTestPage.win';
import FocusTrapZoneTestPage from '../../FocusTrapZone/pages/FocusTrapZonePage.win';
import FocusZoneTestPage from '../../FocusZone/pages/FocusZoneTestPage.win';
import IconTestPage from '../../Icon/pages/IconTestPage.win';
import LinkTestPage from '../../Link/pages/LinkTestPage.win';
import PersonaTestPage from '../../Persona/pages/PersonaTestPage.win';
import PersonaCoinTestPage from '../../PersonaCoin/pages/PersonaCoinTestPage.win';
import PressableTestPage from '../../Pressable/pages/PressableTestPage.win';
import RadioGroupTestPage from '../../RadioGroup/pages/RadioGroupTestPage.win';
import SeparatorTestPage from '../../Separator/pages/SeparatorTestPage.win';
import SvgTestPage from '../../Svg/pages/SvgTestPage.win';
import TextTestPage from '../../Text/pages/TextTestPage.win';
import TabsTestPage from '../../Tabs/pages/TabsTestPage.win';
import ExperimentalTabsTestPage from '../../TabsExperimental/pages/ExperimentalTabsTestPage.win';
import ThemeTestPage from '../../Theme/pages/ThemeTestPage.win';
import BootTestPage from '../pages/BootTestPage.win';

const BOOT_APP_TIMEOUT = 60000;
const PAGE_TIMEOUT = 15000;

// Before testing begins, allow up to 60 seconds for app to open
describe('Open the app', function () {
  it('Boot app', () => {
    BootTestPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    browser.saveScreenshot('./errorShots/testPage.png'); // Take a screenshot of the app for testing purposes
    expect(BootTestPage.isPageLoaded()).toBeTruthy();
  });
});

describe('Click on each test page and check if it renders', function () {
  it('Button Test Page', () => {
    /* Scroll to component test page button in scrollview if not already visible*/
    ButtonTestPage.scrollToComponentButton();
    ButtonTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);

    /* Click on component button to navigate to test page */
    BootTestPage.clickAndGoToButtonPage();
    ButtonTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ButtonTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Callout Test Page', () => {
    CalloutTestPage.scrollToComponentButton();
    CalloutTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToCalloutPage();
    CalloutTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(CalloutTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Checkbox Test Page', () => {
    CheckboxTestPage.scrollToComponentButton();
    CheckboxTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToCheckboxPage();
    CheckboxTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(CheckboxTestPage.isPageLoaded()).toBeTruthy();
  });

  it('ContextualMenu Test Page', () => {
    ContextualMenuTestPage.scrollToComponentButton();
    ContextualMenuTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToContextualMenuPage();
    ContextualMenuTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ContextualMenuTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Experimental Tabs Test Page', () => {
    ExperimentalTabsTestPage.scrollToComponentButton();
    ExperimentalTabsTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToExperimentalTabsPage();
    ExperimentalTabsTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ExperimentalTabsTestPage.isPageLoaded()).toBeTruthy();
  });

  it('FocusTrapZone Test Page', () => {
    FocusTrapZoneTestPage.scrollToComponentButton();
    FocusTrapZoneTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToFocusTrapZonePage();
    FocusTrapZoneTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(FocusTrapZoneTestPage.isPageLoaded()).toBeTruthy();
  });

  it('FocusZone Test Page', () => {
    FocusZoneTestPage.scrollToComponentButton();
    FocusZoneTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToFocusZonePage();
    FocusZoneTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(FocusZoneTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Icon Test Page', () => {
    IconTestPage.scrollToComponentButton();
    IconTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToIconPage();
    IconTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(IconTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Link Test Page', () => {
    LinkTestPage.scrollToComponentButton();
    LinkTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToLinkPage();
    LinkTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(LinkTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Persona Test Page', () => {
    PersonaTestPage.scrollToComponentButton();
    PersonaTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToPersonaPage();
    PersonaTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(PersonaTestPage.isPageLoaded()).toBeTruthy();
  });

  it('PersonaCoin Test Page', () => {
    PersonaCoinTestPage.scrollToComponentButton();
    PersonaCoinTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToPersonaCoinPage();
    PersonaCoinTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(PersonaCoinTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Pressable Test Page', () => {
    PressableTestPage.scrollToComponentButton();
    PressableTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToPressablePage();
    PressableTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(PressableTestPage.isPageLoaded()).toBeTruthy();
  });

  it('RadioGroup Test Page', () => {
    RadioGroupTestPage.scrollToComponentButton();
    RadioGroupTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToRadioGroupPage();
    RadioGroupTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(RadioGroupTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Separator Test Page', () => {
    SeparatorTestPage.scrollToComponentButton();
    SeparatorTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToSeparatorPage();
    SeparatorTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(SeparatorTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Svg Test Page', () => {
    SvgTestPage.scrollToComponentButton();
    SvgTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToSvgPage();
    SvgTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(SvgTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Tabs Test Page', () => {
    TabsTestPage.scrollToComponentButton();
    TabsTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToTabsPage();
    TabsTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(TabsTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Text Test Page', () => {
    TextTestPage.scrollToComponentButton();
    TextTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToTextPage();
    TextTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(TextTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Theme Test Page', () => {
    ThemeTestPage.scrollToComponentButton();
    ThemeTestPage.waitForButtonDisplayed(PAGE_TIMEOUT);
    BootTestPage.clickAndGoToThemePage();
    ThemeTestPage.waitForPageDisplayed(PAGE_TIMEOUT);

    expect(ThemeTestPage.isPageLoaded()).toBeTruthy();
  });
});
