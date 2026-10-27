# E2E Testing Overview

Desktop end-to-end tests run through the application-neutral
[`desktop-test`](../../packages/agentic/desktop-test/README.md) harness and the
[`desktop-driver`](../../packages/agentic/desktop-driver/README.md) W3C WebDriver
server. WebdriverIO and Jasmine own the specs.

`apps/E2E` owns the specs, page objects, and suite definitions
(`desktop.config.mts` and `desktop-specs.mts`). The applications own their
targets (`desktop.config.mts` in `apps/fluent-tester` and `apps/win32`) and run
the suites from their own directories. Applications do not import E2E suites or
install Storybook.

## Run the tests

After `yarn` and `yarn build` at the repository root, run the endpoint's
`e2eprep` and `e2etest` scripts from its app directory:

| Endpoint | Directory            | Prepare                | Test                   | Spec files |
| -------- | -------------------- | ---------------------- | ---------------------- | ---------- |
| macOS    | `apps/fluent-tester` | `yarn e2eprep:macos`   | `yarn e2etest:macos`   | 31         |
| Windows  | `apps/fluent-tester` | `yarn e2eprep:windows` | `yarn e2etest:windows` | 10         |
| Win32    | `apps/win32`         | `yarn e2eprep:win32`   | `yarn e2etest:win32`   | 40         |

`e2etest` runs the `legacy` suite, the grouped selection in `desktop-specs.mts`.
Rerun `e2eprep` when the app, its JavaScript, or its native dependencies change;
`e2etest` alone repeats the tests against what is already prepared. Each stage
also runs alone through the app's `desktop-test` script, for example
`yarn desktop-test --target macos build`.

`e2eprep` runs these stages:

- **macOS:** build or verify the native helper, bundle, `pod install`, then
  build with Xcode. The bundle comes first because CocoaPods embeds only the
  resources that exist during `pod install`.
- **Windows:** build or verify the helper, bundle, generate the Fabric RN Test
  App project, build it with the app's `windows` script in build-only mode,
  and register the Debug package with
  `apps/fluent-tester/scripts/register-windows-app.ps1`. `e2etest` starts Metro
  itself, because Debug builds load their JavaScript from it, launches the
  registered package, and stops both when the run ends.
  The build pins one Windows SDK across the solution so RNSVG's WinMD does not
  target a newer SDK than the app: `WindowsTargetPlatformVersion` when it is set
  (the PR workflow sets 10.0.26100.0, the only SDK on hosted Windows Server
  2025), otherwise 10.0.22621.0. The target explicitly uses the
  Windows title `FluentTester`, rather than the component title `Fluent Tester`.
- **Win32:** build or verify the helper and bundle `dist/index.win32.bundle`.
  There is no native build: `e2etest` launches the prebuilt REX host from
  `@office-iss/rex-win32` against that bundle.

A test run never builds the native helper implicitly. See the `desktop-test`
[commands](../../packages/agentic/desktop-test/references/commands.md) and
[platform setup](../../packages/agentic/desktop-test/references/platforms.md) for
stage semantics.

The suites size the native client window to 1000x680 at (8, 32), keeping it
within the hosted 1024x768 desktop and above the tester's minimum layout size.
On macOS runners that explicitly disable physical clicks, page navigation
uses native focus and Space instead: legacy navigation buttons do not expose
AXPress. Component interaction assertions keep their existing input semantics.

### Prerequisites

- Node.js 22.19 or later (WebdriverIO 10).
- **macOS:** Xcode, CocoaPods, and Accessibility and Screen Recording authority
  for the verified native helper. Check it with
  `desktop-driver doctor --platform macos --permissions`; see
  [getting started](../../packages/agentic/desktop-driver/references/getting-started.md)
  and the [macOS provider guide](../../packages/agentic/desktop-driver/native/macos/README.md).
- **Windows:** the
  [React Native Windows development dependencies](https://microsoft.github.io/react-native-windows/docs/rnw-dependencies)
  (grab every item and the appropriate versions), PowerShell 7 (`pwsh`),
  [Developer Mode](https://docs.microsoft.com/en-us/windows/uwp/get-started/enable-your-device-for-development),
  Windows SDK 10.0.22621.0 (or the SDK named by `WindowsTargetPlatformVersion`),
  and the Windows App Runtime 1.8 that Fabric apps load. See the
  [Windows tester guide](../fluent-tester/docs/windows.md) for more setup.
- **Win32:** a Windows host. The REX host is a prebuilt npm package, so no
  native toolchain is required.

### Suites

`legacy` selects 31 macOS files, 10 Windows files, and 40 Win32 files. The
Windows selection is an allowlist. It omits the `TabsLegacy` and `Tokens`
patterns that the old Windows configuration carried, because neither folder
exists any more: `TabsLegacy` was removed and `Tokens` was split into
`ColorTokens`, `CornerRadiusTokens`, `Spacing`, and others. The harness fails on
any unmatched pattern rather than silently omitting it.

`pilot` and `behavioral-pilot` are smaller suites for qualifying an endpoint.
Run them with the same options as `e2etest`:

```sh
yarn desktop-test --config ../E2E/desktop.config.mts --target win32 test --suite pilot --list
yarn desktop-test --config ../E2E/desktop.config.mts --target win32 test --suite pilot
```

The pilot deliberately starts small: Pressable navigation on Windows/Win32 and
TextLegacy on macOS. It is not the behavioral parity gate.

`--suite behavioral-pilot` selects the unchanged Win32 Button, Checkbox,
Switch, directional FocusZone, and Callout specs in one group. An interactive
Win32 run on October 22, 2026 (UTC) passes all 37 original assertions with no
skips, retries, or infrastructure failures, including keyboard callbacks,
checked/required state, focus navigation, scrolling-dependent page navigation,
and popup opening. This probe is not the complete legacy baseline or an
old/new comparative run. It does not enable restricted input or waive
unsupported assertions.

For macOS Paper, rerun the stages after the bundle with `--paper` on `prep` and
`test`; changing the renderer requires a new `prep`:

```sh
yarn desktop-test --target macos prep --paper
yarn desktop-test --target macos build
yarn desktop-test --config ../E2E/desktop.config.mts --target macos test --suite legacy --paper
```

On October 22, 2026 (UTC), the macOS pilot and all 62 `legacy` tests pass on
both Fabric and Paper, with no skips or retries. Fabric depends on the
repository's RNmacOS Text accessibility patch, described in the
[native-core RNmacOS patch reference](../../packages/agentic/native-core/references/rnmacos-patch.md).
Selected tester buttons are scrolled until their center is inside the list
before clicking, because the native click targets that point.

Jasmine globals, hooks, matchers, retries, and grouped specs remain WDIO-owned.
The shared page adapter maps only established native attributes, uses checked
state for toggles, explicit key actions for chords, and native wheel input for
desktop scrolling. Required state maps to UI Automation's authoritative
`IsRequiredForForm` property; providers without it fail explicitly. `HelpText`
maps to the native `helpText` property on Windows/Win32; absent help text
remains unsupported rather than becoming an empty string. Toggle-pattern
availability remains unmapped. Negative disabled-control click tests use
physical pointer actions, since Element Click rejects disabled controls.
The navigation safety check inspects the native tree instead of XPath.
Scrolling checks the intersection of the scroller and window client viewport,
because a Win32 scroller can extend below the visible window.
Native setup retains initial
window bounds: it does **not** emulate the old maximize hook. Popup lookup
remains scoped to the selected window.

WebdriverIO 10 throws a `StrictSelectorError` when a selector matches several
elements, where WebdriverIO 9 took the first match. A native tree can expose
several elements for one `testID` (a container and its children), and the page
objects rely on the first match, so the shared hooks in
`src/common/desktopHooks.ts` set `strictSelectors: false` for these suites.
Prefer a unique `testID` for new page-object selectors.

Reports, original failures, and target-scoped evidence live under
`artifacts/desktop/<run-id>` (see [Debugging E2E Failures](#debugging-e2e-failures)).
Windows requires a built, registered RN Test App with a verified generated
renderer; macOS requires its own built application and permissions.

The `legacy` lanes replace the former Appium lanes in the PR pipeline, and
Appium is no longer a dependency of this repository. The macOS baseline above is
a local run. On October 27, 2026 (UTC), local interactive runs pass all
201 Win32 Paper tests (40 files) and all 39 Windows Fabric tests (10 files),
with no skips, retries, or infrastructure failures. The Win32 FocusZone
groups have distinct names, as required by Jasmine 6.
These local runs do not qualify the hosted PR environment. Hosted
input-disabled checks do not qualify physical input, and a skipped assertion is
not a pass.

Historical iOS and Android specs remain under `apps/E2E/src` as dormant
assertion references. They have no WebdriverIO configuration, preparation
command, or PR lane. The iOS/Android host and build instructions live in
[`apps/legacy-mobile`](../legacy-mobile/README.md). Do not treat these source
specifications as executed coverage.

# Authoring E2E Test

You just added a new component to FURN... Awesome! Now we need to make sure we have proper regression testing to make sure we put the safest product out there (don't worry, it's not as hard as it sounds). Here's what we have to do:

## Create New E2E Testing Folder for the New Component

All our E2E testing logic exists in _/apps/E2E/src/_.

Testing is split-up on a **per-component** basis. Each component's testing story is made up of two parts - a **Page Object** and a **Spec Document**.

Example File Structure:

-> Checkbox Folder

----> CheckboxPageObject.ts

----> CheckboxSpec.ts

Please follow this structure for the new component.

## Create New Constants

The way we our automation framework interacts with our test app is by selecting UI components based on a string value. For this, we have a **consts.ts** file for each component that defines these values.
You'll want to make one for your component under **apps/E2E/src/_your-component_/consts.ts** and export it from `apps/E2E/src/index.consts.ts`; test pages import the constants from `@fluentui-react-native/e2e-testing`.

**You can simply copy/paste a _consts.ts_ file from another component, and just change the name of the component in the const names and the values.**

**This is really important!**

There are a **two specific** naming conventions we need to follow to keep in-sync with the Native side.

1. The button that navigates to each test page - **Homepage\_'componentName'\_Button**
2. The test page itself that lets us validate if the page loaded - **'componentName'\_TestPage**

Now, what are Page Objects and Spec Documents?

## Page Objects

A page object is an object-oriented class. The purpose of this class is to act as an interface for you to interact with a page of your testing app. In layman's terms, **it selects UI elements and performs some functions on them to obtain the scenario you want.**

For each component/scenario you want to test, you will have a page object class for it.

Page Object is a design pattern which has become popular in test automation for enhancing test maintenance and reducing code duplication. A [page object](https://webdriver.io/docs/pageobjects.html) is an object-oriented class that serves as an interface to a page of you testing app. The tests then use the methods of this Page Object whenever they need to interact with the UI of that page.
The benefit is that if the UI changes for the test page, the tests themselves don’t need to change, only the code within the page object needs to change.

Page Objects should be put in apps/E2E/src/_ _ComponentToBeTested_ _/pages/.

In most cases, you can copy/paste ButtonPageObject.ts and simply change all instances of Button to your new component.

```ts
// CheckboxPageObject.win.ts
class CheckboxPageObject extends BasePage {
  // This function clicks on the Checkbox component you selected below
  toggleCheckbox() {
    this._testPage.click();
  }

  // This function gives the identifier of the test page's first section. This is used to test page load.
  get _pageName() {
    return CHECKBOX_TESTPAGE;
  }

  // This function gives the identifier of the button that navigates to the component's test page.
  get _pageButtonName() {
    return HOMEPAGE_CHECKBOX_BUTTON;
  }
}

export default new CheckboxPageObject();
```

### More on Page Objects (Technical Information)

Each page object should extend BasePage.ts. The BasePage class contains a baseline set of methods/variables that all page objects should have. This allows us to write the most efficient code possible.

For example, a common task we want to perform is selecting a UI element and getting its accessibilityRole attribute. Instead of doing this in all 20 page objects for each component, we write it once in the BasePage, and have the 20 page objects extend it. Enables code-reuse and allows for easy comprehension.

### **Selectors**

- In order for a Page Object to access a component from the test page, you must use [selectors](https://webdriver.io/docs/selectors.html). The WebDriver Protocol provides several selector strategies to query an element.

- The underlying Android test drivers use [accessibilityLabel](https://reactnative.dev/docs/accessibility#accessibilitylabel) to find elements. However, all other platforms use [testID](https://reactnative.dev/docs/next/view#testid). Because of this, we're adding the testProps function that takes in a unique identifier and returns the correct prop based on the platform (testID for Win32, Windows, macOS, iOS; accessibilityId for Android).
  If explict accessibilityLabel is being used for other platforms, apply testProps after it to override it for Android.

- If testProps is specified, the locator strategy should choose accessibility id.
  A unique accessiblity id/testID per Window is recommended for E2E testing when authoring the test app and test cases.

- To use this, we must add a prop to our component or UI element in question called `testProps`. In our test page, set the `testProps` for the component after accessibilityLabel prop (if present), and we can then select it in our Page Object using the imported **_By_** method above from a base class.

## Setup your Component Test Page in the Test App

In order to test the component, we need a test page in FURNs test app. Looking at existing test pages, each test page is made up of one or more sections showing off different use cases of the component. These sections are rendered using the `<Test />` component.

```tsx
const checkboxSections: TestSection[] = [
  {
    name: 'Basic Checkboxes', // This is the title of said section, rendered before the contents.
    component: BasicCheckbox, // Pass a React Component to render below the title.
    testID: CHECKBOXV1_TESTPAGE, // You can optionally add a `testID` to the title so we can find and interact with the element during automation. Attach to check if the page renders.
  },
  {
    name: 'Size Checkboxes',
    component: SizeCheckbox,
  },
];

export const CheckboxTest = () => {
  return <Test name="Checkbox Test" description={description} sections={checkboxSections} status={status} />;
};
```

When building the test page, make sure to do the following:

- Pass a `testID` to the first test section. The `testID` should equal the `_pageName` const set in the component's page object because during each test, we initially check if the page loads by checking if the element with a `testID = _pageName` is visible.
- If your component needs dedicated accessibility or functionality tests, create a dedicated `TestSection` with elements designated for use during automated E2E testing. These elements should have a `testID` assigned by passing `{...testProps(your_components_constant)}` to the props of the component so we can use our Page Object to interact with the component. Once your section is built, pass the section to the `<Test />` element via the `e2eSections` prop. The reason the E2E section is separate from the regular test sections is because these need to be rendered at the very top of the test page to reduce the time it takes for an E2E component to load into view for each test. They are also initially hidden for aesthetic purposes and get revealed during automation.

```tsx
const e2eSections: TestSection = [
  {
    name: 'E2E Testing for CheckboxV1',
    component: E2ECheckboxV1Test,
  },
];

export const CheckboxTest = () => {
  return <Test name="Checkbox Test" description={description} sections={checkboxSections} status={status} e2eSections={e2eSections} />;
};
```

## Write a Test Spec

The spec document is where the tests will be written. We use [Jasmine](https://jasmine.github.io/), an open-sourced testing framework for JavaScript.
The spec document imports a page object and uses it to manipulate the UI and uses 'expect' and other Jasmine statements to ensure proper functionality.

Spec documents should be put in apps/E2E/src/_ComponentToBeTested_/specs/.

```
describe('Click on each test page and check if it renders', function() {
  it('Checkbox Test Page', () => {
    CheckboxPageObject.navigateToPageAndLoadTests(true); // pass true if you have a dedicated section for E2E tests
});
```

# Debugging E2E Failures

The run stops at the first failure (`bail: 1`), so find the **first** failing test and focus on that one.

## Locally

Every run writes `artifacts/desktop/<run-id>/` under the project that owns the configuration. `e2etest` uses the E2E configuration, so its runs are in `apps/E2E/artifacts/desktop`. The `e2eprep` stages use the app's configuration, so their runs are in `apps/fluent-tester/artifacts/desktop` or `apps/win32/artifacts/desktop`. All three folders are git-ignored.

| Artifact         | Contents                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `junit.xml`      | Test outcomes, infrastructure errors, and incomplete work                                                 |
| `run.json`       | Tests, attempts, failures, evidence, and the final status                                                 |
| `events.jsonl`   | The versioned, source-attributed event journal                                                            |
| `commands/`      | Redacted stdout and stderr of each command: the build, Metro, and the WDIO worker                         |
| `evidence/<id>/` | Captured when a test fails: a screenshot, the page source, the accessibility tree, and other open windows |

Progress and failures stream to the terminal as the run proceeds, and a failed command replays its collected output. For a failing `e2eprep` stage, start with its log under `commands/`. For a failing test, start with the first failed entry in `run.json` and its `evidence/` folder. A red-box error in the app appears in the screenshot and page source. See [reporting](../../packages/agentic/desktop-test/references/reporting.md) for the format.

## In CI

The `macos`, `windows`, and `win32` jobs in [`pr.yml`](../../.github/workflows/pr.yml) upload the artifact folders even when a run fails, as `E2E_<endpoint>_<renderer>_<run id>_<attempt>`. Download the artifact from the workflow run's summary and read it the same way as a local run. It also contains the driver setup's doctor report and, on Windows, the helper build logs and any `ReactApp.exe` crash dumps.
