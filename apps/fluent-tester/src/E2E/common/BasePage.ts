const DUMMY_CHAR = '';
export const COMPONENT_SCROLL_COORDINATES = { x: -0, y: -40 }; // These are the offsets. Y is negative because we want the touch to move up (and thus it scrolls down)

export function By(testId: string): WebdriverIO.Element {
  return $('~' + testId);
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
  getAccessibilityRole(): string {
    return this._primaryComponent.getAttribute('ControlType');
  }

  /* Gets the accessibility label of an UI element given the selector */
  getAccessibilityLabel(componentSelector: ComponentSelector): string {
    switch (componentSelector) {
      case ComponentSelector.Primary:
        return this._primaryComponent.getAttribute('Name');

      case ComponentSelector.Secondary:
        return this._secondaryComponent.getAttribute('Name');
    }
  }

  /* Returns true if the test page has loaded. To determine if it's loaded, each test page has a specific UI element we attempt to locate.
   * If this UI element is located, we know the page as loaded correctly. The UI element we look for is a Text component that contains
   * the title of the page (this._testPage returns that UI element)  */
  isPageLoaded(): boolean {
    return this._testPage.isDisplayed();
  }

  /* Returns true if the test page's button is displayed (the button that navigates to each test page) */
  isButtonInView(): boolean {
    return this._pageButton.isDisplayed();
  }

  /* Scrolls until the desired test page's button is displayed. We use the scroll viewer UI element as the point to start scrolling.
   * We use a negative number as the Y-coordinate because that enables us to scroll downwards */
  scrollToComponentButton(): void {
    if (!this.isButtonInView()) {
      const scrollViewElement = $('~SCROLLVIEW_TEST_ID');
      driver.touchScroll(COMPONENT_SCROLL_COORDINATES.x, COMPONENT_SCROLL_COORDINATES.y, scrollViewElement.elementId);
    }
  }

  /* Waits for the test page to load. If the test page doesn't load before the timeout, it causes the test to fail. */
  waitForPageDisplayed(timeout?: number): void {
    browser.waitUntil(
      () => {
        return this.isPageLoaded();
      },
      timeout ?? this.waitForPageTimeout,
      this._pageName + ' did not render correctly. Please see /errorShots of the first failed test for more information.',
      1000,
    );
  }

  /* Waits for the test page's button to be displayed. If the button doesn't load before the timeout, it causes the test to fail. */
  waitForButtonDisplayed(timeout?: number): void {
    browser.waitUntil(
      () => {
        return this.isButtonInView();
      },
      timeout ?? this.waitForPageTimeout,
      'The button to navigate to the ' +
        this._pageName +
        ' was not displayed correctly. Please see /errorShots of the first failed test for more information.',
      1000,
    );
  }

  /* Waits for the primary UI test element to be displayed. If the element doesn't load before the timeout, it causes the test to fail. */
  waitForPrimaryElementDisplayed(timeout?: number): void {
    browser.waitUntil(
      () => {
        return this._primaryComponent.isDisplayed();
      },
      timeout ?? this.waitForPageTimeout,
      'The primary UI element for testing did not display correctly. Please see /errorShots of the first failed test for more information.',
      1000,
    );
  }

  /* Scrolls to the primary UI test element until it is displayed. */
  scrollToTestElement(): void {
    while (!this._primaryComponent.isDisplayed()) {
      driver.touchScroll(COMPONENT_SCROLL_COORDINATES.x, COMPONENT_SCROLL_COORDINATES.y, this._testPage.elementId);
    }
  }

  /* A method that allows the caller to pass in a condition. A wrapper for waitUntil(). Once testing becomes more extensive,
   * this will allow cleaner code within all the Page Objects. */
  waitForCondition(condition?: () => boolean, errorMsg?: string, timeout?: number): void {
    browser.waitUntil(
      () => {
        return condition();
      },
      timeout ?? this.waitForPageTimeout,
      errorMsg ?? 'Error. Please see /errorShots and logs for more information.',
      1000,
    );
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
  get _testPage(): WebdriverIO.Element {
    return By(DUMMY_CHAR);
  }

  // Returns: UI Element
  // The primary UI element used for testing on the given test page.
  get _primaryComponent(): WebdriverIO.Element {
    return By(DUMMY_CHAR);
  }

  // Returns: UI Element
  // The secondary UI element used for testing on the given test page. Often times, we'll want to set a
  // prop on one component, and not set it on another to verify certain behaviors. This is why we have this secondary component.
  get _secondaryComponent(): WebdriverIO.Element {
    return By(DUMMY_CHAR);
  }

  // Returns: UI Element
  // The button that navigates you to the component's test page.
  get _pageButton(): WebdriverIO.Element {
    return By(DUMMY_CHAR);
  }

  // Returns: String
  // Returns the name of the test page. Useful for error messages (see above).
  get _pageName(): string {
    return DUMMY_CHAR;
  }

  // Default timeout to wait until page is displayed (10s)
  waitForPageTimeout: number = 15000;
}
