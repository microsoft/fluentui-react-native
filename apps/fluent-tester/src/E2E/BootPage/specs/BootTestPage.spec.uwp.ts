import BootTestPage from '../pages/BootTestPage.win';
import ButtonTestPage from '../../Button/pages/ButtonTestPage.win';
import CheckboxTestPage from '../../Checkbox/pages/CheckboxTestPage.win';
import CalloutTestPage from '../../Callout/pages/CalloutTestPage.win';
import LinkTestPage from '../../Link/pages/LinkTestPage.win';
import PersonaCoinTestPage from '../../PersonaCoin/pages/PersonaCoinTestPage.win';
import PressableTestPage from '../../Pressable/pages/PressableTestPage.win';
import RadioGroupTestPage from '../../RadioGroup/pages/RadioGroupTestPage.win';
import SeparatorTestPage from '../../Separator/pages/SeparatorTestPage.win';
import TextTestPage from '../../Text/pages/TextTestPage.win';
import ThemeTestPage from '../../Theme/pages/ThemeTestPage.win';

// Before testing begins, wait for bundle to load for 30 seconds
beforeAll(() => {
  BootTestPage.waitForPageLoaded(30000);
});

describe('Click on each test page and check if it renders', function() {
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
    CheckboxTestPage.waitForPageLoaded(5000);
    expect(CheckboxTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Link Test Page', () => {
    BootTestPage.clickAndGoToLinkPage();
    LinkTestPage.waitForPageLoaded(5000);
    expect(LinkTestPage.isPageLoaded()).toBeTruthy();
  });

  it('PersonaCoin Test Page', () => {
    BootTestPage.clickAndGoToPersonaCoinPage();
    PersonaCoinTestPage.waitForPageLoaded(5000);
    expect(PersonaCoinTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Pressable Test Page', () => {
    BootTestPage.clickAndGoToPressablePage();
    PressableTestPage.waitForPageLoaded(5000);
    expect(PressableTestPage.isPageLoaded()).toBeTruthy();
  });

  it('RadioGroup Test Page', () => {
    BootTestPage.clickAndGoToRadioGroupPage();
    RadioGroupTestPage.waitForPageLoaded(5000);
    expect(RadioGroupTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Separator Test Page', () => {
    BootTestPage.clickAndGoToSeparatorPage();
    SeparatorTestPage.waitForPageLoaded(5000);
    expect(SeparatorTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Text Test Page', () => {
    BootTestPage.clickAndGoToTextPage();
    TextTestPage.waitForPageLoaded(5000);
    expect(TextTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Theme Test Page', () => {
    BootTestPage.clickAndGoToThemePage();
    ThemeTestPage.waitForPageLoaded(5000);
    expect(ThemeTestPage.isPageLoaded()).toBeTruthy();
  });
});
