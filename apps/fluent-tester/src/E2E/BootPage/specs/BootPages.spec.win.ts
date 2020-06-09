import BootTestPage from '../pages/BootTestPage.win';
import ButtonTestPage from '../../Button/pages/ButtonTestPage.win';
import CheckboxTestPage from '../../Checkbox/pages/CheckboxTestPage.win';
import CalloutTestPage from '../../Callout/pages/CalloutTestPage.win';
import FocusTrapZoneTestPage from '../../FocusTrapZone/pages/FocusTrapZonePage.win';
import LinkTestPage from '../../Link/pages/LinkTestPage.win';
import PersonaCoinTestPage from '../../PersonaCoin/pages/PersonaCoinTestPage.win';
import PersonaTestPage from '../../Persona/pages/PersonaTestPage.win';
import PressableTestPage from '../../Pressable/pages/PressableTestPage.win';
import RadioGroupTestPage from '../../RadioGroup/pages/RadioGroupTestPage.win';
import SeparatorTestPage from '../../Separator/pages/SeparatorTestPage.win';
import TextTestPage from '../../Text/pages/TextTestPage.win';
import ThemeTestPage from '../../Theme/pages/ThemeTestPage.win';
import SvgTestPage from '../../Svg/pages/SvgTestPage.win';

const ERROR_MESSAGE = 'This test failed due to a previous test failure. Please see above.';

describe('Click on each test page and check if it renders', function () {
  it('Button Test Page', () => {
    BootTestPage.clickAndGoToButtonPage();
    ButtonTestPage.waitForPageDisplayed(3000);
    expect(ButtonTestPage.isPageLoaded()).toBeTruthy(ERROR_MESSAGE);
  });

  it('Callout Test Page', () => {
    BootTestPage.clickAndGoToCalloutPage();
    CalloutTestPage.waitForPageDisplayed(3000);
    expect(CalloutTestPage.isPageLoaded()).toBeTruthy(ERROR_MESSAGE);
  });

  it('Checkbox Test Page', () => {
    BootTestPage.clickAndGoToCheckboxPage();
    CheckboxTestPage.waitForPageDisplayed(3000);
    expect(CheckboxTestPage.isPageLoaded()).toBeTruthy(ERROR_MESSAGE);
  });

  it('FocusTrapZone Test Page', () => {
    BootTestPage.clickAndGoToFocusTrapZonePage();
    FocusTrapZoneTestPage.waitForPageDisplayed(3000);
    expect(FocusTrapZoneTestPage.isPageLoaded()).toBeTruthy(ERROR_MESSAGE);
  });

  it('Link Test Page', () => {
    BootTestPage.clickAndGoToLinkPage();
    LinkTestPage.waitForPageDisplayed(3000);
    expect(LinkTestPage.isPageLoaded()).toBeTruthy(ERROR_MESSAGE);
  });

  it('Persona Test Page', () => {
    BootTestPage.clickAndGoToPersonaPage();
    PersonaTestPage.waitForPageDisplayed(3000);
    expect(PersonaTestPage.isPageLoaded()).toBeTruthy(ERROR_MESSAGE);
  });

  it('PersonaCoin Test Page', () => {
    BootTestPage.clickAndGoToPersonaCoinPage();
    PersonaCoinTestPage.waitForPageDisplayed(3000);
    expect(PersonaCoinTestPage.isPageLoaded()).toBeTruthy(ERROR_MESSAGE);
  });

  it('Pressable Test Page', () => {
    BootTestPage.clickAndGoToPressablePage();
    PressableTestPage.waitForPageDisplayed(3000);
    expect(PressableTestPage.isPageLoaded()).toBeTruthy(ERROR_MESSAGE);
  });

  it('RadioGroup Test Page', () => {
    BootTestPage.clickAndGoToRadioGroupPage();
    RadioGroupTestPage.waitForPageDisplayed(3000);
    expect(RadioGroupTestPage.isPageLoaded()).toBeTruthy(ERROR_MESSAGE);
  });

  it('Separator Test Page', () => {
    BootTestPage.clickAndGoToSeparatorPage();
    SeparatorTestPage.waitForPageDisplayed(3000);
    expect(SeparatorTestPage.isPageLoaded()).toBeTruthy(ERROR_MESSAGE);
  });

  it('Svg Test Page', () => {
    BootTestPage.clickAndGoToSvgPage();
    SvgTestPage.waitForPageDisplayed(3000);
    expect(SvgTestPage.isPageLoaded()).toBeTruthy(ERROR_MESSAGE);
  });

  it('Text Test Page', () => {
    BootTestPage.clickAndGoToTextPage();
    TextTestPage.waitForPageDisplayed(3000);
    expect(TextTestPage.isPageLoaded()).toBeTruthy(ERROR_MESSAGE);
  });

  it('Theme Test Page', () => {
    BootTestPage.clickAndGoToThemePage();
    ThemeTestPage.waitForPageDisplayed(3000);
    expect(ThemeTestPage.isPageLoaded()).toBeTruthy(ERROR_MESSAGE);
  });
});
