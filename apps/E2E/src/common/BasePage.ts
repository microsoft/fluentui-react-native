import {
  AndroidAttribute,
  androidAttributeToEnumName,
  Attribute,
  attributeToEnumName,
  BASE_TESTPAGE,
  BOOT_APP_TIMEOUT,
  E2E_MODE_SWITCH,
  E2E_TEST_SECTION,
  Keys,
  ROOT_VIEW,
  TESTPAGE_BUTTONS_SCROLLVIEWER,
  TESTPAGE_CONTENT_SCROLLVIEWER,
} from './consts';

const DUMMY_CHAR = '';
// The E2ETEST_PLATFORM environment variable should be set in the beforeSession hook in the wdio.conf file for the respective platform
const PLATFORM = process.env['E2ETEST_PLATFORM'] as Platform;
export const COMPONENT_SCROLL_COORDINATES = { x: -0, y: -100 }; // These are the offsets. Y is negative because we want the touch to move up (and thus it scrolls down)

let rootView: WebdriverIO.Element | null = null;

/* Win32/UWP-Specific Selector. We use this to get elements on the test page */
export async function By(identifier: string) {
  if (PLATFORM === 'windows') {
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

type MobilePlatform = 'android' | 'ios';

type DesktopPlatform = 'win32' | 'windows' | 'macos';

type Platform = MobilePlatform | DesktopPlatform;

/****************************** IMPORTANT! PLEASE READ! **************************************************
 * Every component's page object extends this. We can assume each test page will interact with at least
 * two UI elements, so we'll add integration for two UI elements in this file (See *Getters* section below).
 * Every additional UI element that a test page wants to interact with should be handled in that respective
 * component's page object.
 *********************************************************************************************************/

export abstract class BasePage {
  protected platform?: Platform;

  constructor() {
    if (PLATFORM) {
      this.platform = PLATFORM as Platform;
    }
  }
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/

  /**
   * For any given page object, this method automates:
   *  - Navigating to the page by clicking its component button
   *  - Waiting for the component page to load
   *
   * This also contains error checking through its waiters, removing the extra `expect()` calls during test setup.
   */
  async navigateToPageAndLoadTests(): Promise<boolean | void> {
    // Desktop platforms automatically scroll to a page's navigation button - this extra step is purely for mobile platforms.
    if (this.platform === 'android' || this.platform === 'ios') {
      await this.mobileScrollToComponentButton();
    }

    await (await this._pageButton).click();

    // Wait for page to load
    return await this.waitForCondition(async () => await this.isPageLoaded(), this.ERRORMESSAGE_PAGELOAD, this.waitForUiEvent, 1500);
  }

  /*
   * Some components' E2E tests check only if the test page loads correctly or not. Others
   * (majority), perform UI manipulation tests on UI components on the test page. In these scenarios, these UI components have their
   * own section on the test page (by default, it's hidden so partners don't see it). This method opens up that testing section.
  */
  async enableE2ETesterMode(): Promise<boolean | void> {
    const e2eSwitch = await this._e2eSwitch;
    await browser.waitUntil(async () => await e2eSwitch.isDisplayed() && await e2eSwitch.isEnabled(),
    {
      timeout: 15000,
      timeoutMsg: 'The E2E Switch should be enabled and visible before we interact with it'
    })

    switch (this.platform) {
      // Usually, we use .isSelected() to see if a control (our switch) is checked true or false, but the process is
      // different on android because .isSelected() doesn't function as expected on the platform.
      case 'android':
        if ((await e2eSwitch.getAttribute(AndroidAttribute.Checked)) === 'false') {
          await e2eSwitch.click();
          await this.waitForCondition(
            async () => (await e2eSwitch.getAttribute(AndroidAttribute.Checked)) === 'true',
            'Clicked the E2E Mode Switch, but it failed to toggle.',
          );
        }
        break;
      default:
        if (!(await e2eSwitch.isSelected())) {
          await e2eSwitch.click();
          await this.waitForCondition(async () => e2eSwitch.isSelected(), 'Clicked the E2E Mode Switch, but it failed to toggle.');
        }
    }

    return await this.waitForCondition(
      async () => await (await this._e2eSection).isDisplayed(),
      'Pressed E2E Mode Switch, but E2E Test Sections failed to display before the timeout.',
    );
  }

  /**
   * Checks to see if an element attribute is strictly equal to an expected value the user passes in.
   * The advantage to this over testing using .isEqual in a spec is that this throws a detailed error if
   * the expected and actual values don't match. This should be called for attribute tests in specs. */
  async compareAttribute(
    element: Promise<WebdriverIO.Element>,
    attribute: Attribute | AndroidAttribute,
    expectedValue: any,
  ): Promise<boolean> {
    const el = await element;

    try {
      await browser.waitUntil(async () => expectedValue === await el.getAttribute(attribute));
    } catch {
      const actualValue = await el.getAttribute(attribute);
      switch (this.platform) {
        case 'android':
          throw new Error(
            `On ${this._pageName}, expected attribute ${androidAttributeToEnumName[attribute]} value to be ${expectedValue} but got ${actualValue}`,
          );
        default:
          throw new Error(
            `On ${this._pageName}, a test component with a testID = '${await el.getAttribute(Attribute.TestID)}' should have attribute, ${
              attributeToEnumName[attribute]
            } (which maps to windows attribute '${attribute}' property on the element), equal to '${expectedValue}'. Instead, ${
              attributeToEnumName[attribute]
            } is equal to '${actualValue}'.`,
          );
      }
    }

    return true;
  }

  /* Returns true if the test page has loaded. To determine if it's loaded, each test page has a specific UI element we attempt to locate.
   * If this UI element is located, we know the page as loaded correctly. The UI element we look for is a Text component that contains
   * the title of the page (this._testPage returns that UI element)  */
  async isPageLoaded(): Promise<boolean> {
    return (await (await this._testPage).isDisplayed()) || (await (await this._primaryComponent).isDisplayed());
  }

  /** Given a WebdriverIO element promise, send a click input to the element. Use this across all PageObject methods and test specs. */
  async click(element: Promise<WebdriverIO.Element>): Promise<void> {
    await (await element).click();
  }

  /** Given a WebdriverIO element promise, send the passed in list of keys as keyboard inputs. Use this across all PageObject methods and test specs.
   *
   * Common examples:
   * - Press enter on a button control: ButtonPageObject.sendKeys(ButtonPageObject.button, [KEY_ENTER])
   * - Shift tab to the previous element: FocusZonePageObject.sendKeys(FocusZonePageObject.beforeButton, [KEY_SHIFT, KEY_TAB])
   * - Escape out of a menu: MenuPageObject.sendKeys(MenuPageObject.item1, [KEY_ESCAPE])
   */
  async sendKeys(element: Promise<WebdriverIO.Element>, keys: Keys[]): Promise<void> {
    await (await element).addValue(keys);
  }

  /** Short-hand method for PageObjects to get an element attribute during testing, with attribute being type-enforced. */
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
      case 'ios': {
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
      case 'android':
        /* 'mobile: scroll' which is used for iOS, does not support direction option on Android.
         * Instead, we use the UiScrollable class to scroll down to the desired view based on its 'description' (accessibilityLabel).
         * The first selector tells which container to scroll in, and the other selector tells which component to scroll to. */
        await browser.waitUntil(
          async () => {
            const buttonElementSelector = `new UiScrollable(new UiSelector().description("${TESTPAGE_BUTTONS_SCROLLVIEWER}").scrollable(true)).setMaxSearchSwipes(10).setAsVerticalList().scrollIntoView(new UiSelector().description("${this._pageButtonName}"))`;
            const pageButton = await $(`android=${buttonElementSelector}`);
            return await pageButton.isDisplayed();
          },
          {
            timeout: this.waitForUiEvent,
            timeoutMsg: errorMsg,
          },
        );
        break;
    }
  }

  /** Waits for the tester app to load by checking if the startup page loads. If the app doesn't load before the timeout, it causes the test to fail. */
  async waitForInitialPageToDisplay(): Promise<boolean | void> {
    return await this.waitForCondition(async () => await (await this._initialPage).isDisplayed(), this.ERRORMESSAGE_APPLOAD, BOOT_APP_TIMEOUT);
  }

  /* Scrolls to the specified or primary UI test element until it is displayed. */
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

  /* Scrolls to the specified or primary UI test element until it is displayed. */
  async mobileScrollToTestElement(componentIdentifier?: string): Promise<void> {
    const componentToScrollTo = componentIdentifier ?? this._primaryComponentName;
    if (await (await By(componentToScrollTo)).isDisplayed()) {
      return;
    }

    const errorMsg = 'Could not scroll to the ' + componentToScrollTo + '. Please see Pipeline artifacts for more debugging information.';

    switch (this.platform) {
      case 'ios': {
        await browser.waitUntil(
          async () => {
            await driver.execute('mobile: scroll', { direction: 'down' });
            return await (await By(componentToScrollTo)).isDisplayed();
          },
          {
            timeout: this.waitForUiEvent,
            timeoutMsg: errorMsg,
          },
        );
        break;
      }
      case 'android':
        /* 'mobile: scroll' which is used for iOS, does not support direction option on Android.
         * Instead, we use the UiScrollable class to scroll down to the desired view based on its 'description' (accessibilityLabel).
         * The first selector tells which container to scroll in, and the other selector tells which component to scroll to. */
        await browser.waitUntil(
          async () => {
            const componentSelector = `new UiScrollable(new UiSelector().description("${TESTPAGE_CONTENT_SCROLLVIEWER}").scrollable(true)).setMaxSearchSwipes(10).scrollIntoView(new UiSelector().description("${componentIdentifier}"))`;
            const component = await $(`android=${componentSelector}`);
            return await component.isDisplayed();
          },
          {
            timeout: this.waitForUiEvent,
            timeoutMsg: errorMsg,
          },
        );
        break;
    }
  }

  /* A method that allows the caller to pass in a condition. A wrapper for waitUntil(). Once testing becomes more extensive,
   * this will allow cleaner code within all the Page Objects. */
  async waitForCondition(condition: () => Promise<boolean>, errorMsg?: string, timeout?: number, interval?: number): Promise<boolean | void> {
    return await browser.waitUntil(async () => await condition(), {
      timeout: timeout ?? this.waitForUiEvent,
      timeoutMsg: errorMsg ?? 'Error. Please see /errorShots and logs for more information.',
      interval: interval ?? 1000,
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
    /* On Android, we can't get the window handles. Instead, we check if the page is still visible.
     * In case of any error, a full page crash message is displayed and the test page is no longer accessible. */
    if (PLATFORM === 'android') {
      return !(await this.isPageLoaded());
    }
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
  get _testPage(): Promise<WebdriverIO.Element> {
    return By(this._pageName);
  }

  // Returns: UI Element
  // The primary UI element used for testing on the given test page.
  get _primaryComponent() {
    return By(this._primaryComponentName);
  }

  // Returns: UI Element
  // The secondary UI element used for testing on the given test page. Often times, we'll want to set a
  // prop on one component, and not set it on another to verify certain behaviors. This is why we have this secondary component.
  get _secondaryComponent() {
    return By(this._secondaryComponentName);
  }

  // Returns: UI Element
  // The button that navigates you to the component's test page.
  get _pageButton(): Promise<WebdriverIO.Element> {
    return By(this._pageButtonName);
  }

  // Returns: String
  // Returns the name of the test page. Useful for error messages (see above).
  abstract get _pageName(): string;

  // Returns: String
  // Returns the name of the button that navigates to the test page.
  abstract get _pageButtonName(): string;

  // Returns: String
  // Returns the identifier of the primary UI element used for testing on the given test page.
  get _primaryComponentName(): string {
    console.warn('Please verify whether or not your page object should implement _primaryComponentName.');
    return DUMMY_CHAR;
  }

  // Returns: String
  // Returns the identifier of the secondary UI element used for testing on the given test page. Often times, we'll want to set a
  // prop on one component, and not set it on another to verify certain behaviors. This is why we have this secondary component.
  get _secondaryComponentName(): string {
    console.warn('Please verify whether or not your page object should implement _secondaryComponentName.');
    return DUMMY_CHAR;
  }

  // The scrollviewer containing the list of buttons to navigate to each test page
  get _testPageButtonScrollViewer() {
    return By(TESTPAGE_BUTTONS_SCROLLVIEWER);
  }

  // The title element of the initial test page shown when starting the app.
  get _initialPage() {
    return By(BASE_TESTPAGE);
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

  private get _e2eSwitch(): Promise<WebdriverIO.Element> {
    return By(E2E_MODE_SWITCH);
  }

  private get _e2eSection(): Promise<WebdriverIO.Element> {
    return By(E2E_TEST_SECTION);
  }

  // Default timeout to wait until page is displayed (25s)
  waitForUiEvent = 25000;
}
