import BootTestPage from '../pages/BootTestPage';
import ButtonTestPage from '../pages/ButtonTestPage';
import CheckboxTestPage from '../pages/CheckboxTestPage';
import CalloutTestPage from '../pages/CalloutTestPage';
import FocusTrapZoneTestPage from '../pages/FocusTrapZonePage';
import LinkTestPage from '../pages/LinkTestPage';
import PersonaCoinTestPage from '../pages/PersonaCoinTestPage';
import PersonaTestPage from '../pages/PersonaTestPage';
import PressableTestPage from '../pages/PressableTestPage';
import RadioGroupTestPage from '../pages/RadioGroupTestPage';
import SeparatorTestPage from '../pages/SeparatorTestPage';
// import SvgTestPage from '../pages/SvgTestPage';
import TextTestPage from '../pages/TextTestPage';
import ThemeTestPage from '../pages/ThemeTestPage';

describe('Clicks on each test page and checks if it renders', function() {
  it('Button Test Page', () => {
    BootTestPage.clickAndGoToButtonPage();
    expect(ButtonTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Callout Test Page', () => {
    BootTestPage.clickAndGoToCalloutPage();
    expect(CalloutTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Checkbox Test Page', () => {
    BootTestPage.clickAndGoToCheckboxPage();
    expect(CheckboxTestPage.isPageLoaded()).toBeTruthy();
  });

  it('FocusTrapZone Test Page', () => {
    BootTestPage.clickAndGoToFocusTrapZonePage();
    expect(FocusTrapZoneTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Link Test Page', () => {
    BootTestPage.clickAndGoToLinkPage();
    expect(LinkTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Persona Test Page', () => {
    BootTestPage.clickAndGoToPersonaPage();
    expect(PersonaTestPage.isPageLoaded()).toBeTruthy();
  });

  it('PersonaCoin Test Page', () => {
    BootTestPage.clickAndGoToPersonaCoinPage();
    expect(PersonaCoinTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Pressable Test Page', () => {
    BootTestPage.clickAndGoToPressablePage();
    expect(PressableTestPage.isPageLoaded()).toBeTruthy();
  });

  it('RadioGroup Test Page', () => {
    BootTestPage.clickAndGoToRadioGroupPage();
    expect(RadioGroupTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Separator Test Page', () => {
    BootTestPage.clickAndGoToSeparatorPage();
    expect(SeparatorTestPage.isPageLoaded()).toBeTruthy();
  });

  // it('Svg Test Page', () => {
  //   BootTestPage.clickAndGoToSvgPage();
  //   expect(SvgTestPage.isPageLoaded()).toBeTruthy();
  // });

  it('Text Test Page', () => {
    BootTestPage.clickAndGoToTextPage();
    expect(TextTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Theme Test Page', () => {
    BootTestPage.clickAndGoToThemePage();
    expect(ThemeTestPage.isPageLoaded()).toBeTruthy();
  });
});
