import BootTestPage from '../pages/BootTestPage.win';
import ButtonTestPage from '../../Button/pages/ButtonTestPage.win';
import CalloutTestPage from '../../Callout/pages/CalloutTestPage.win';
import CheckboxTestPage from '../../Checkbox/pages/CheckboxTestPage.win';
import LinkTestPage from '../../Link/pages/LinkTestPage.win';
import PersonaCoinTestPage from '../../PersonaCoin/pages/PersonaCoinTestPage.win';
import PressableTestPage from '../../Pressable/pages/PressableTestPage.win';
import RadioGroupTestPage from '../../RadioGroup/pages/RadioGroupTestPage.win';
import SeparatorTestPage from '../../Separator/pages/SeparatorTestPage.win';
import TextTestPage from '../../Text/pages/TextTestPage.win';
import ThemeTestPage from '../../Theme/pages/ThemeTestPage.win';

const PAGE_TIMEOUT = 45000;

// Before testing begins, allow 45 seconds for bundle to load (WebDriverIO)
beforeAll(() => {
  BootTestPage.waitForPageLoaded(PAGE_TIMEOUT);
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
    expect(CheckboxTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Link Test Page', () => {
    BootTestPage.clickAndGoToLinkPage();
    expect(LinkTestPage.isPageLoaded()).toBeTruthy();
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

  it('Text Test Page', () => {
    BootTestPage.clickAndGoToTextPage();
    expect(TextTestPage.isPageLoaded()).toBeTruthy();
  });

  it('Theme Test Page', () => {
    BootTestPage.clickAndGoToThemePage();
    expect(ThemeTestPage.isPageLoaded()).toBeTruthy();
  });
});
