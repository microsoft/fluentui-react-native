# E2E Testing Overview

## Prerequisites

- [Node.js](https://nodejs.org/en/download/) - Version 10.19 or higher.
- [React Native Windows Development Dependencies](https://microsoft.github.io/react-native-windows/docs/rnw-dependencies)
  - **NOTE:** Please make sure you grab all of the items listed there and the appropriate versions.
- [WinAppDriver](https://github.com/microsoft/WinAppDriver) - Version 1.1
- Enable [_Developer Mode_](https://docs.microsoft.com/en-us/windows/uwp/get-started/enable-your-device-for-development) in Windows settings

## E2E Project Structure

- E2E - The root E2E testing folder containing test components and their respective platform-specific page objects and spec documents.
- reports - Each platform folder (apple, win32, windows) contains this folder that saves the test reports from Appium/WebDriverIO.
- wdio.conf.js - Each platform folder contains this file. It's the configuration file for WebDriverIO, which also configures Appium and WinAppDriver parameters.

# Running E2E Tests

1. Install node packages, build JS
   - C:\repo> `cd fluentui-react-native`
   - C:\repo\fluentui-react-native> `yarn`
   - C:\repo\fluentui-react-native> `yarn build`
2. Bundle the test app (pick specific platform you want to test, we'll use win32)
   - C:\repo\fluentui-react-native>`cd apps\win32`
   - C:\repo\fluentui-react-native\apps\win32> `yarn bundle`
3. Run E2E tests
   - C:\repo\fluentui-react-native\apps\win32> `yarn run e2etest`

# Authoring E2E Test

## Create a new Page Object

Page Object is a design pattern which has become popular in test automation for enhancing test maintenance and reducing code duplication. A [page object](https://webdriver.io/docs/pageobjects.html) is an object-oriented class that serves as an interface to a page of you testing app. The tests then use the methods of this Page Object whenever they need to interact with the UI of that page.
The benefit is that if the UI changes for the test page, the tests themselves don’t need to change, only the code within the page object needs to change.

Page Objects should be put in apps/fluent-tester/src/E2E/_ *ComponentToBeTested* _/pages/.

```
// CheckboxTestPage.win.ts
class CheckboxTestPage extends BasePage {

  toggleCheckbox() {
    this._testPage.click();
  }

  get _testPage() {
    return By(CHECKBOX_TESTPAGE);
  }
}

export default new CheckboxTestPage();
```

### **Selectors**

- In order for a Page Object to access a component from the test page, you must use [selectors](https://webdriver.io/docs/selectors.html). The WebDriver Protocol provides several selector strategies to query an element.

- If [testID](https://reactnative.dev/docs/picker-item#testid) is specified in React Native app for Windows, the locator strategy should choose accessibility id.
  A unique accessiblity id/testID per Window is recommended for React Native Windows E2E testing when authoring the test app and test cases.

- To use this, we must add a prop to our component or UI element in question called “testID”. In our test page, set the “testID” for the component, and we can then select it in our Page Object using the imported **_By_** method above from a base class.

## Write a Test Spec

The spec document is where the tests will be written. We use [Jasmine](https://jasmine.github.io/), an open-sourced testing framework for JavaScript.
The spec document imports a page object and uses it to manipulate the UI and uses 'expect' and other Jasmine statements to ensure proper functionality.

Spec documents should be put in apps/fluent-tester/src/E2E/\_ _ComponentToBeTested_ /specs/.

```
describe('Click on each test page and check if it renders', function() {
  it('Checkbox Test Page', () => {
    BootTestPage.clickAndGoToCheckboxPage();
    expect(CheckboxTestPage.isPageLoaded()).toBeTruthy();
  });
});
```
