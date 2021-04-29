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
import ThemeTestPage from '../../Theme/pages/ThemeTestPage.win';
import BootTestPage from '../pages/BootTestPage.win';

const BOOT_APP_TIMEOUT = 60000;
const PAGE_TIMEOUT = 3000;

// Before testing begins, allow up to 60 seconds for app to open
describe('Open the app', function () {
  it('Boot app', () => {
    BootTestPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(BootTestPage.isPageLoaded()).toBeTruthy();
  });
});

describe('Click on each test page and check if it renders', function () {
  it('Button Test Page', () => {
    BootTestPage.clickAndGoToButtonPage();
    ButtonTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(ButtonTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Callout Test Page', () => {
    BootTestPage.clickAndGoToCalloutPage();
    CalloutTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(CalloutTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Checkbox Test Page', () => {
    BootTestPage.clickAndGoToCheckboxPage();
    CheckboxTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(CheckboxTestPage.isPageLoaded()).toBeTruthy();
  });

  it('ContextualMenu Test Page', () => {
    BootTestPage.clickAndGoToContextualMenuPage();
    ContextualMenuTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(ContextualMenuTestPage.isPageLoaded()).toBeTruthy();
  });

  it('FocusTrapZone Test Page', () => {
    BootTestPage.clickAndGoToFocusTrapZonePage();
    FocusTrapZoneTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(FocusTrapZoneTestPage.isPageLoaded()).toBeTruthy();
  });

  it('FocusZone Test Page', () => {
    BootTestPage.clickAndGoToFocusZonePage();
    FocusZoneTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(FocusZoneTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Icon Test Page', () => {
    BootTestPage.clickAndGoToIconPage();
    IconTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(IconTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Link Test Page', () => {
    BootTestPage.clickAndGoToLinkPage();
    LinkTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(LinkTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Persona Test Page', () => {
    BootTestPage.clickAndGoToPersonaPage();
    PersonaTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(PersonaTestPage.isPageLoaded()).toBeTruthy();
  });

  it('PersonaCoin Test Page', () => {
    BootTestPage.clickAndGoToPersonaCoinPage();
    PersonaCoinTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(PersonaCoinTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Pressable Test Page', () => {
    BootTestPage.clickAndGoToPressablePage();
    PressableTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(PressableTestPage.isPageLoaded()).toBeTruthy();
  });

  it('RadioGroup Test Page', () => {
    BootTestPage.clickAndGoToRadioGroupPage();
    RadioGroupTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(RadioGroupTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Separator Test Page', () => {
    BootTestPage.clickAndGoToSeparatorPage();
    SeparatorTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(SeparatorTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Svg Test Page', () => {
    BootTestPage.clickAndGoToSvgPage();
    SvgTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(SvgTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Text Test Page', () => {
    BootTestPage.clickAndGoToTextPage();
    TextTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(TextTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Theme Test Page', () => {
    BootTestPage.clickAndGoToThemePage();
    ThemeTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(ThemeTestPage.isPageLoaded()).toBeTruthy();
  });
});
