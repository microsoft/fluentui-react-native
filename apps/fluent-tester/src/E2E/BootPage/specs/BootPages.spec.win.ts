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
// import SvgTestPage from '../../Svg/pages/SvgTestPage.win';

const PAGE_TIMEOUT = 45000;

// Before testing begins, allow 45 seconds for bundle to load (WebDriverIO)
beforeAll(() => {
  BootTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
});

describe('Click on each test page and check if it renders', function () {
  it('Button Test Page', () => {
    BootTestPage.clickAndGoToButtonPage();
    ButtonTestPage.waitForPageDisplayed(3000);
    expect(ButtonTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Callout Test Page', () => {
    BootTestPage.clickAndGoToCalloutPage();
    CalloutTestPage.waitForPageDisplayed(3000);
    expect(CalloutTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Checkbox Test Page', () => {
    BootTestPage.clickAndGoToCheckboxPage();
    CheckboxTestPage.waitForPageDisplayed(3000);
    //browser.react$('Text').click();
    //expect(browser.react$('Checkbox', { props: { label: 'Checked checkbox (uncontrolled)'}})).toBeNull();
    expect(CheckboxTestPage.isPageLoaded()).toBeTruthy();
  });

  it('FocusTrapZone Test Page', () => {
    BootTestPage.clickAndGoToFocusTrapZonePage();
    FocusTrapZoneTestPage.waitForPageDisplayed(3000);
    expect(FocusTrapZoneTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Link Test Page', () => {
    BootTestPage.clickAndGoToLinkPage();
    LinkTestPage.waitForPageDisplayed(3000);
    expect(LinkTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Persona Test Page', () => {
    BootTestPage.clickAndGoToPersonaPage();
    PersonaTestPage.waitForPageDisplayed(3000);
    expect(PersonaTestPage.isPageLoaded()).toBeTruthy();
  });

  it('PersonaCoin Test Page', () => {
    BootTestPage.clickAndGoToPersonaCoinPage();
    PersonaCoinTestPage.waitForPageDisplayed(3000);
    expect(PersonaCoinTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Pressable Test Page', () => {
    BootTestPage.clickAndGoToPressablePage();
    PressableTestPage.waitForPageDisplayed(3000);
    expect(PressableTestPage.isPageLoaded()).toBeTruthy();
  });

  it('RadioGroup Test Page', () => {
    BootTestPage.clickAndGoToRadioGroupPage();
    RadioGroupTestPage.waitForPageDisplayed(3000);
    expect(RadioGroupTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Separator Test Page', () => {
    BootTestPage.clickAndGoToSeparatorPage();
    SeparatorTestPage.waitForPageDisplayed(3000);
    expect(SeparatorTestPage.isPageLoaded()).toBeTruthy();
  });

  // it('Svg Test Page', () => {
  //   BootTestPage.clickAndGoToSvgPage();
  //   SvgTestPage.waitForPageDisplayed(3000);
  //   expect(SvgTestPage.isPageLoaded()).toBeTruthy();
  // });

  it('Text Test Page', () => {
    BootTestPage.clickAndGoToTextPage();
    TextTestPage.waitForPageDisplayed(3000);
    expect(TextTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Theme Test Page', () => {
    BootTestPage.clickAndGoToThemePage();
    ThemeTestPage.waitForPageDisplayed(3000);
    expect(ThemeTestPage.isPageLoaded()).toBeTruthy();
  });
});
