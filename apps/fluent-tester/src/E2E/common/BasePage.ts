import { Keys, ROOT_VIEW } from './consts';
import { TESTPAGE_BUTTONS_SCROLLVIEWER } from '../../TestComponents/Common/consts';
import { Attribute } from './consts';

const DUMMY_CHAR = '';
// The E2ETEST_PLATFORM environment variable should be set in the beforeSession hook in the wdio.conf file for the respective platform
const PLATFORM = process.env['E2ETEST_PLATFORM'];
export const COMPONENT_SCROLL_COORDINATES = { x: -0, y: -100 }; // These are the offsets. Y is negative because we want the touch to move up (and thus it scrolls down)

let rootView: WebdriverIO.Element | null = null;

/* Win32/UWP-Specific Selector. We use this to get elements on the test page */
export async function By(identifier: string) {
  if (PLATFORM === NativePlatform.Windows) {
    // For some reason, the rootView node is never put into the element tree on the UWP tester. Remove this when fixed.
    return await $('~' + identifier);
  }
  return await QueryWithChaining(identifier);
}

async function QueryWithChaining(identifier) {
  if (rootView === null) {
    // Most of the elements we're searching for will be children of this rootView node.
    rootView = await $('~' + ROOT_VIEW);
  }
  const selector = '~' + identifier;
  let queryResult: WebdriverIO.Element;
  queryResult = await rootView.$(selector);
  if (queryResult.error) {
    // In some cases, such as opened ContextualMenu items, the element nodes are not children of the rootView node, meaning we need to start our search from the top of the tree.
    queryResult = await $(selector);
  }
  return queryResult;
}

/* The values in this enum map to the UI components we want to test in our app. We use this to
make the communication from our spec document to our page object easier. Please read below to
see why we have Primary/Secondary components. */
export const enum ComponentSelector {
  Primary = 0, // this._primaryComponent
  Secondary, // this._secondaryComponent
}

export const enum MobilePlatform {
  iOS = 'ios',
  Android = 'android',
}

export const enum NativePlatform {
  Win32 = 'win32',
  Windows = 'windows',
  macOS = 'macos',
}

export type Platform = MobilePlatform | NativePlatform;

/****************************** IMPORTANT! PLEASE READ! **************************************************
 * Every component's page object extends this. We can assume each test page will interact with at least
 * two UI elements, so we'll add integration for two UI elements in this file (See *Getters* section below).
 * Every additional UI element that a test page wants to interact with should be handled in that respective
 * component's page object.
 *********************************************************************************************************/

export class BasePage {
  private platform?: Platform;

  constructor() {
    if (PLATFORM) {
      this.platform = PLATFORM as Platform;
    }
  }
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async getAccessibilityRole(): Promise<string> {
    return await this.getElementAttribute(await this._primaryComponent, Attribute.AccessibilityRole);
  }

  /* Gets the accessibility label of an UI element given the selector */
  async getAccessibilityLabel(componentSelector: ComponentSelector): Promise<string> {
    switch (componentSelector) {
      case ComponentSelector.Primary:
        return await this.getElementAttribute(await this._primaryComponent, Attribute.AccessibilityLabel);

      case ComponentSelector.Secondary:
        return await this.getElementAttribute(await this._secondaryComponent, Attribute.AccessibilityLabel);
    }
  }

  /* Returns true if the test page has loaded. To determine if it's loaded, each test page has a specific UI element we attempt to locate.
   * If this UI element is located, we know the page as loaded correctly. The UI element we look for is a Text component that contains
   * the title of the page (this._testPage returns that UI element)  */
  async isPageLoaded(): Promise<boolean> {
    return (await this._testPage).isDisplayed();
  }

  /* Returns true if the test page's button is displayed (the button that navigates to each test page) */
  async isButtonInView(): Promise<boolean> {
    return await (await this._pageButton).isDisplayed();
  }

  async clickComponent(): Promise<void> {
    await (await this._primaryComponent).click();
  }

  async getElementAttribute(element: WebdriverIO.Element, attribute: Attribute) {
    return await element.getAttribute(attribute);
  }

  /* Scrolls until the desired test page's button is displayed. We use the scroll viewer UI element as the point to start scrolling.
   * We use a negative number as the Y-coordinate because that enables us to scroll downwards */
  async mobileScrollToComponentButton(): Promise<void> {
    if (await (await this._pageButton).isDisplayed()) {
      return;
    }

    const errorMsg =
      'Could not scroll to the ' + this._pageName + "'s Button. Please see Pipeline artifacts for more debugging information.";

    switch (this.platform) {
      case MobilePlatform.iOS: {
        await browser.waitUntil(
          async () => {
            await driver.execute('mobile: scroll', { direction: 'down' });
            return await (await this._pageButton).isDisplayed();
          },
          {
            timeout: this.waitForUiEvent,
            timeoutMsg: errorMsg,
          },
        );
        break;
      }
      default:
      case MobilePlatform.Android:
        // Todo
        break;
    }
  }

  /* Waits for the test page to load. If the test page doesn't load before the timeout, it causes the test to fail. */
  async waitForPageDisplayed(timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await this.isPageLoaded(), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg: this._pageName + ' did not render correctly. Please see /errorShots for more information.',
      interval: 1500,
    });
  }

  /* Waits for the test page's button to be displayed. If the button doesn't load before the timeout, it causes the test to fail. */
  async waitForButtonDisplayed(timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await this.isButtonInView(), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg: 'Could not find the button to navigate to ' + this._pageName + '. Please see /errorShots for more information.',
      interval: 1500,
    });
  }

  /* Waits for the primary UI test element to be displayed. If the element doesn't load before the timeout, it causes the test to fail. */
  async waitForPrimaryElementDisplayed(timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await (await this._primaryComponent).isDisplayed(), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg:
        'The primary UI element for testing did not display correctly. Please see /errorShots of the first failed test for more information.',
      interval: 1500,
    });
  }

  /* Scrolls to the primary UI test element until it is displayed. */
  async scrollToTestElement(component?: WebdriverIO.Element): Promise<void> {
    const ComponentToScrollTo = component ?? (await this._primaryComponent);
    if (await ComponentToScrollTo.isDisplayed()) {
      return;
    }

    // This button is at the top of every test page. It allows us to put focus in the test page pane so we can type PageDown
    const FocusButton = await By('Focus_Button');
    const scrollDownKeys = [Keys.PAGE_DOWN];
    await browser.waitUntil(
      async () => {
        await FocusButton.addValue(scrollDownKeys);
        scrollDownKeys.push(Keys.PAGE_DOWN);
        return await ComponentToScrollTo.isDisplayed();
      },
      {
        timeout: 30000,
        timeoutMsg:
          'Could not scroll to the ' +
          this._pageName +
          "'s main test element. Please see Pipeline artifacts for more debugging information.",
      },
    );

    // We have this extra scroll here to ensure the whole component is visible.
    await FocusButton.addValue(scrollDownKeys);
  }

  /* A method that allows the caller to pass in a condition. A wrapper for waitUntil(). Once testing becomes more extensive,
   * this will allow cleaner code within all the Page Objects. */
  async waitForCondition(condition: () => Promise<boolean>, errorMsg?: string, timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await condition(), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg: errorMsg ?? 'Error. Please see /errorShots and logs for more information.',
      interval: 1000,
    });
  }

  /* FUNCTIONALITY: Determines if an Assert has fired. True if yes; false otherwise
   *
   * WHY/HOW: Unfortunately, some Asserts don't take focus away from the test app. Because of this, the test execution is able
   * to continue without realizing an assert as popped up (unless the assert is a crashing one).
   *
   * In order to detect an assert, this function gets the number of window handles currently open within the test app.
   * Only one instance SHOULD be open at a time (the app itself). If another instance of the app is open, we know an assert dialogue
   * has popped up. With this information, we know to fail the test.
   *
   * Additionally, you might think it's logical to simply place this in the afterEach() hook so it's called after every test (rather than duplicating this call in every test).
   * Unfortunately, afterEach() is designed for setup/teardown - not for determining if a test should fail or not.
   * */
  async didAssertPopup(): Promise<boolean> {
    // If more than 1 instance of the app is open, we know an assert dialogue popped up.
    const windowHandles = await browser.getWindowHandles();
    return windowHandles.length > 1;
  }

  /*****************************************/
  /**************** Getters ****************/
  /*****************************************/

  /*  IMPORTANT:
   *  Each PageObject class that extends this class is expected to override these values.
   *  This is necessary because each page will have different IDs for their respective UI elements.
   *  DUMMY_CHAR is just a placeholder.
   */

  // Returns: UI Element
  // The Text component on each test page containing the title of that page. We can use this to determine if a test page has loaded correctly.
  get _testPage() {
    return By(DUMMY_CHAR);
  }

  // Returns: UI Element
  // The primary UI element used for testing on the given test page.
  get _primaryComponent() {
    return By(DUMMY_CHAR);
  }

  // Returns: UI Element
  // The secondary UI element used for testing on the given test page. Often times, we'll want to set a
  // prop on one component, and not set it on another to verify certain behaviors. This is why we have this secondary component.
  get _secondaryComponent() {
    return By(DUMMY_CHAR);
  }

  // Returns: UI Element
  // The button that navigates you to the component's test page.
  get _pageButton() {
    return By(DUMMY_CHAR);
  }

  // Returns: String
  // Returns the name of the test page. Useful for error messages (see above).
  get _pageName(): string {
    return DUMMY_CHAR;
  }

  // The scrollviewer containing the list of buttons to navigate to each test page
  get _testPageButtonScrollViewer() {
    return By(TESTPAGE_BUTTONS_SCROLLVIEWER);
  }

  /****************** Error Messages ******************/
  get ERRORMESSAGE_SUFFIX(): string {
    return 'Please review logs and error screenshots for more information.';
  }

  get ERRORMESSAGE_APPLOAD(): string {
    return 'The FluentTester app did not load correctly. ' + this.ERRORMESSAGE_SUFFIX;
  }

  get ERRORMESSAGE_PAGELOAD(): string {
    return 'The ' + this._pageName + ' test page did not load correctly. ' + this.ERRORMESSAGE_SUFFIX;
  }

  get ERRORMESSAGE_ASSERT(): string {
    return 'An assert popped up. ' + this.ERRORMESSAGE_SUFFIX;
  }

  // Default timeout to wait until page is displayed (10s)
  waitForUiEvent: number = 25000;
}
