const DUMMY_CHAR = '';
export const COMPONENT_SCROLL_COORDINATES = { x: -0, y: -100 }; // These are the offsets. Y is negative because we want the touch to move up (and thus it scrolls down)

/* Mac-Specific Selector. We use this to get elements on the test page.
 * Specifically, this is the xpath selector. See https://v6.webdriver.io/docs/selectors.html#xpath */
export function By(identifier: string) {
  return $('//*[@identifier="' + identifier + '"]');
}

/* The values in this enum map to the UI components we want to test in our app. We use this to
make the communication from our spec document to our page object easier. Please read below to
see why we have Primary/Secondary components. */
export const enum ComponentSelector {
  Primary = 0, // this._primaryComponent
  Secondary, // this._secondaryComponent
}

/****************************** IMPORTANT! PLEASE READ! **************************************************
 * Every component's page object extends this. We can assume each test page will interact with at least
 * two UI elements, so we'll add integration for two UI elements in this file (See *Getters* section below).
 * Every additional UI element that a test page wants to interact with should be handled in that respective
 * component's page object.
 *********************************************************************************************************/

export class BasePage {
  /******************************************************************/
  /**************** UI Element Interaction Methods ******************/
  /******************************************************************/
  async getAccessibilityRole(): Promise<string> {
    return await this._primaryComponent.getAttribute('ControlType');
  }

  /* Gets the accessibility label of an UI element given the selector */
  async getAccessibilityLabel(componentSelector: ComponentSelector): Promise<string> {
    switch (componentSelector) {
      case ComponentSelector.Primary:
        return await this._primaryComponent.getAttribute('Name');

      case ComponentSelector.Secondary:
        return await this._secondaryComponent.getAttribute('Name');
    }
  }

  /* Returns true if the test page has loaded. To determine if it's loaded, each test page has a specific UI element we attempt to locate.
   * If this UI element is located, we know the page as loaded correctly. The UI element we look for is a Text component that contains
   * the title of the page (this._testPage returns that UI element)  */
  async isPageLoaded(): Promise<boolean> {
    return await this._testPage.isDisplayed();
  }

  /* Returns true if the test page's button is displayed (the button that navigates to each test page) */
  async isButtonInView(): Promise<boolean> {
    return await this._pageButton.isDisplayed();
  }

  /* Scrolls until the desired test page's button is displayed. We use the scroll viewer UI element as the point to start scrolling.
   * We use a negative number as the Y-coordinate because that enables us to scroll downwards */
  async scrollToComponentButton(): Promise<void> {
    /* TODO: Implement (not needed yet) */
  }

  /* Waits for the test page to load. If the test page doesn't load before the timeout, it causes the test to fail. */
  async waitForPageDisplayed(timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await this.isPageLoaded(), {
      timeout: timeout ?? this.waitForPageTimeout,
      timeoutMsg: this._pageName + ' did not render correctly. Please see /errorShots for more information.',
      interval: 1000,
    });
  }

  /* Waits for the test page's button to be displayed. If the button doesn't load before the timeout, it causes the test to fail. */
  async waitForButtonDisplayed(timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await this.isButtonInView(), {
      timeout: timeout ?? this.waitForPageTimeout,
      timeoutMsg: 'Could not find the button to navigate to ' + this._pageName + '. Please see /errorShots for more information.',
      interval: 1000,
    });
  }

  /* Waits for the primary UI test element to be displayed. If the element doesn't load before the timeout, it causes the test to fail. */
  async waitForPrimaryElementDisplayed(timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await this._primaryComponent.isDisplayed(), {
      timeout: timeout ?? this.waitForPageTimeout,
      timeoutMsg:
        'The primary UI element for testing did not display correctly. Please see /errorShots of the first failed test for more information.',
      interval: 1000,
    });
  }

  /* Scrolls to the primary UI test element until it is displayed. It uses the ScrollView that encapsulates each test page. */
  async scrollToTestElement(): Promise<void> {
    /* TODO: Implement (not needed yet) */
  }

  /* A method that allows the caller to pass in a condition. A wrapper for waitUntil(). Once testing becomes more extensive,
   * this will allow cleaner code within all the Page Objects. */
  async waitForCondition(condition?: () => Promise<boolean>, errorMsg?: string, timeout?: number): Promise<void> {
    await browser.waitUntil(async () => await condition(), {
      timeout: timeout ?? this.waitForPageTimeout,
      timeoutMsg: errorMsg ?? 'Error. Please see /errorShots and logs for more information.',
      interval: 1000,
    });
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

  // Returns: Promise<string>
  // Returns the name of the test page. Useful for error messages (see above).
  get _pageName(): string {
    return DUMMY_CHAR;
  }

  // Default timeout to wait until page is displayed (10s)
  waitForPageTimeout: number = 15000;
}
