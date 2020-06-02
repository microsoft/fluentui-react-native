import BootTestPage from '../pages/BootTestPage.win';
import ButtonTestPage from '../../Button/pages/ButtonTestPage.win';
import CheckboxTestPage from '../../Checkbox/pages/CheckboxTestPage.win';
import CalloutTestPage from '../../Callout/pages/CalloutTestPage.win';
// import FocusTrapZoneTestPage from '../../FocusTrapZone/pages/FocusTrapZonePage.win';
// import LinkTestPage from '../../Link/pages/LinkTestPage.win';
// import PersonaCoinTestPage from '../../PersonaCoin/pages/PersonaCoinTestPage.win';
// import PersonaTestPage from '../../Persona/pages/PersonaTestPage.win';
// import PressableTestPage from '../../Pressable/pages/PressableTestPage.win';
// import RadioGroupTestPage from '../../RadioGroup/pages/RadioGroupTestPage.win';
// import SeparatorTestPage from '../../Separator/pages/SeparatorTestPage.win';
// import TextTestPage from '../../Text/pages/TextTestPage.win';
// import ThemeTestPage from '../../Theme/pages/ThemeTestPage.win';
import SvgTestPage from '../../Svg/pages/SvgTestPage.win';

describe('Click on each test page and check if it renders', function () {
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

  // it('FocusTrapZone Test Page', () => {
  //   BootTestPage.clickAndGoToFocusTrapZonePage();
  //   expect(FocusTrapZoneTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Link Test Page', () => {
  //   BootTestPage.clickAndGoToLinkPage();
  //   expect(LinkTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Persona Test Page', () => {
  //   BootTestPage.clickAndGoToPersonaPage();
  //   expect(PersonaTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('PersonaCoin Test Page', () => {
  //   BootTestPage.clickAndGoToPersonaCoinPage();
  //   expect(PersonaCoinTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Pressable Test Page', () => {
  //   BootTestPage.clickAndGoToPressablePage();
  //   expect(PressableTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('RadioGroup Test Page', () => {
  //   BootTestPage.clickAndGoToRadioGroupPage();
  //   expect(RadioGroupTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Separator Test Page', () => {
  //   BootTestPage.clickAndGoToSeparatorPage();
  //   expect(SeparatorTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Text Test Page', () => {
  //   BootTestPage.clickAndGoToTextPage();
  //   expect(TextTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Theme Test Page', () => {
  //   BootTestPage.clickAndGoToThemePage();
  //   expect(ThemeTestPage.isPageLoaded()).toBeTruthy();
  // });

  it('Svg Test Page', () => {
    BootTestPage.clickAndGoToSvgPage();
    SvgTestPage.waitForPageDisplayed(3000);
    expect(SvgTestPage.isPageLoaded()).toBeTruthy();
  });
});
