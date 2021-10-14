// import ButtonTestPage from '../../Button/pages/ButtonTestPage.win';
// import CalloutTestPage from '../../Callout/pages/CalloutTestPage.win';
// import CheckboxTestPage from '../../Checkbox/pages/CheckboxTestPage.win';
// import ContextualMenuTestPage from '../../ContextualMenu/pages/ContextualMenuTestPage.win';
// import FocusTrapZoneTestPage from '../../FocusTrapZone/pages/FocusTrapZonePage.win';
// import FocusZoneTestPage from '../../FocusZone/pages/FocusZoneTestPage.win';
// import IconTestPage from '../../Icon/pages/IconTestPage.win';
// import LinkTestPage from '../../Link/pages/LinkTestPage.win';
// import PersonaTestPage from '../../Persona/pages/PersonaTestPage.win';
// import PersonaCoinTestPage from '../../PersonaCoin/pages/PersonaCoinTestPage.win';
// import PressableTestPage from '../../Pressable/pages/PressableTestPage.win';
// import RadioGroupTestPage from '../../RadioGroup/pages/RadioGroupTestPage.win';
// import SeparatorTestPage from '../../Separator/pages/SeparatorTestPage.win';
import SvgTestPage from '../../Svg/pages/SvgTestPage.win';
import TextTestPage from '../../Text/pages/TextTestPage.win';
import TabsTestPage from '../../Tabs/pages/TabsTestPage.win';
// import ExperimentalTabsTestPage from '../../TabsExperimental/pages/ExperimentalTabsTestPage.win';
import ThemeTestPage from '../../Theme/pages/ThemeTestPage.win';
import BootTestPage from '../pages/BootTestPage.win';

const BOOT_APP_TIMEOUT = 60000;
const PAGE_TIMEOUT = 15000;

// Before testing begins, allow up to 60 seconds for app to open
describe('Open the app', function () {
  it('Boot app', () => {
    BootTestPage.waitForPageDisplayed(BOOT_APP_TIMEOUT);
    expect(BootTestPage.isPageLoaded()).toBeTruthy();
  });
});

describe('Click on each test page and check if it renders', function () {
  // it('Button Test Page', () => {
  //   ButtonTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToButtonPage();
  //   ButtonTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(ButtonTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Callout Test Page', () => {
  //   CalloutTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToCalloutPage();
  //   CalloutTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(CalloutTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Checkbox Test Page', () => {
  //   CheckboxTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToCheckboxPage();
  //   CheckboxTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(CheckboxTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('ContextualMenu Test Page', () => {
  //   ContextualMenuTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToContextualMenuPage();
  //   ContextualMenuTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(ContextualMenuTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Experimental Tabs Test Page', () => {
  //   ExperimentalTabsTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToExperimentalTabsPage();
  //   ExperimentalTabsTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(ExperimentalTabsTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('FocusTrapZone Test Page', () => {
  //   FocusTrapZoneTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToFocusTrapZonePage();
  //   FocusTrapZoneTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(FocusTrapZoneTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('FocusZone Test Page', () => {
  //   FocusZoneTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToFocusZonePage();
  //   FocusZoneTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(FocusZoneTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Icon Test Page', () => {
  //   IconTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToIconPage();
  //   IconTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(IconTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Link Test Page', () => {
  //   LinkTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToLinkPage();
  //   LinkTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(LinkTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Persona Test Page', () => {
  //   PersonaTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToPersonaPage();
  //   PersonaTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(PersonaTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('PersonaCoin Test Page', () => {
  //   PersonaCoinTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToPersonaCoinPage();
  //   PersonaCoinTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(PersonaCoinTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Pressable Test Page', () => {
  //   PressableTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToPressablePage();
  //   PressableTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(PressableTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('RadioGroup Test Page', () => {
  //   RadioGroupTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToRadioGroupPage();
  //   RadioGroupTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(RadioGroupTestPage.isPageLoaded()).toBeTruthy();
  // });

  // it('Separator Test Page', () => {
  //   SeparatorTestPage.scrollToComponentButton();
  //   BootTestPage.clickAndGoToSeparatorPage();
  //   SeparatorTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
  //   expect(SeparatorTestPage.isPageLoaded()).toBeTruthy();
  // });

  it('Svg Test Page', () => {
    if (!SvgTestPage.isButtonInView()) {
      browser.saveScreenshot('svgBefore.png');
      SvgTestPage.scrollToComponentButton();
      browser.saveScreenshot('svgAfter.png');
    }
    BootTestPage.clickAndGoToSvgPage();
    SvgTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(SvgTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Tabs Test Page', () => {
    if (!TabsTestPage.isButtonInView()) {
      browser.saveScreenshot('tabsBefore.png');
      TabsTestPage.scrollToComponentButton();
      browser.saveScreenshot('tabsAfter.png');
    }
    BootTestPage.clickAndGoToTabsPage();
    TabsTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(TabsTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Text Test Page', () => {
    if (!TextTestPage.isButtonInView()) {
      browser.saveScreenshot('textBefore.png');
      TextTestPage.scrollToComponentButton();
      browser.saveScreenshot('textAfter.png');
    }
    BootTestPage.clickAndGoToTextPage();
    TextTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(TextTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Theme Test Page', () => {
    if (!ThemeTestPage.isButtonInView()) {
      browser.saveScreenshot('themeBefore.png');
      ThemeTestPage.scrollToComponentButton();
      browser.saveScreenshot('themeAfter.png');
    }
    BootTestPage.clickAndGoToThemePage();
    ThemeTestPage.waitForPageDisplayed(PAGE_TIMEOUT);
    expect(ThemeTestPage.isPageLoaded()).toBeTruthy();
  });
});
