# Contributing

## Pre-requisites

This guide assumes you:

- Have read through the [React Native Docs](https://reactnative.dev/docs/getting-started). In particular:
  - Understand classes vs function components (we use the latter) and [hooks](https://reactjs.org/docs/hooks-intro.html). Here's a good [video](https://www.youtube.com/watch?v=dpw9EHDh2bM) that explains function components and hooks for traditional OOP developers.
  - Understand [Native Modules](https://reactnative.dev/docs/native-modules-ios).
- Have a local fork of FluentUI React Native and have run the test app.

## Understanding the Repository Structure

There are some specific quirks to this repository that one should be familiar with.

### Old framework vs new framework (Compose V2)

There's [documentation](./packages/components/README.md) for how to author a control, specifically with the two frameworks [foundation-compose](./packages/deprecated/foundation-compose/README.md) and [foundation-composable](./packages/deprecated/foundation-composable/README.md). Since that documentation was written, we have written a new component framework (PR's [here](https://github.com/microsoft/fluentui-react-native/pull/335) and [here](https://github.com/microsoft/fluentui-react-native/pull/400)) at `packages/experimental/framework` that is simpler/easier to use, and is the new preferred way to create components. Components that use this new framework are located at `packages/experimental` and are copies of the controls located at `packages/components` which still uses the old frameworks. Any new components should use the new framework. The old documentation is still good to read, specifically for using foundation-compose, as a lot of it applies to the new component.

There are two directories where components exist, the normal `packages/components` and `packages/experimental`. In general, the `experimental` directory is where components and frameworks we are iterating on get placed.

## Understanding the framework

Our framework has a few key concepts that you should be familiar with.

### Slots

The "Slot" pattern is an abstraction pattern used to compose higher order components. The pattern allows us to divide the props of one component into multiple "slots". An individual slot represents your inner component, in essence the actual entries that you will put in your render tree. Using the slot pattern lets you abstract away specifically what gets rendered in the tree and in advanced user scenarios allow you to switch out or flatten slots. For example, you might choose to replace whatever we put in the default "icon" slot for a button with an SVG, or a spinner. You could replace the root slot of a radio group with a focus trapzone if the radio button is a required part of the form. The props are assigned to whatever happens to get rendered for that slot. It is also built to help with style creation for the slots to help keep object references to the produced style objects consistent and use cached results where possible.

One caveat is that if a component simply wraps a single native component, then it only has one slot.

### Tokens

FluentUI React Native (and eventually all of FluentUI) uses the design token system to handle styling / customization. There's extended [documentation](./packages/deprecated/foundation-tokens/README.md) about this in the repo, but here is a simple overview.

**Tokens** are things you set at design time, via theme, or via customizing the control. An example might be "brandColor", where each app has it's own color token it sets on all if its controls.

**Props** are just normal properties that you can set on a JSX element. An example might be "isAnimating".

Tokens can also be props (which is specified in the compose framework with the "TokensThatAreAlsoProps" field of the control)
Tokens help us achieve simpler customization for complex higher order components, and also help with memoization (AKA rendering the minimal set of changes every time the component is re-rendered).

## Creating a new component

This section covers creating and adding a new component package to FluentUI React Native's monorepo. If you are instead working on an existing component and adding a native module, skip to the next two sections.

Most components should use the compose framework as it offers the comprehensive set of patterns like tokens and slots, but if you're creating a simple component that doesn't require those patterns, there's a lighter pattern called [stagedComponent](./packages/framework/use-slot/src/stagedComponent.ts). The stagedComponent pattern splits up the render function into two stages. Stage 1 handles building props and hook calls (best to separate the hook calls from the render tree since they rely on call order). Stage 2 returns the actual element tree, any conditional branching should happen here (Icon is a good example of using stagedCompoenent).

1. Create a new directory in of these two locations, depending on your component:

   - `fluentui-react-native/packages/components/<new-component>`
   - `fluentui-react-native/packages/experimental/<new-component>`

1. Copy the files from the top level of another component (A good example of this is the Shimmer). Make sure to empty the changelog file, and modify the name of the component where appropriate.
1. Update your `package.json` file. This defines the name, fields, and dependencies of the npm package that will be published for this component.
1. As a pattern, we prefix `experimental` components with the word "experimental". For example, we have `@fluentui-react-native/experimental-button`.

**Additionally, we require integrating your new component/test page with our E2E testing infrastructure. Whenever a new component/test page is created, it should map to new tests in /apps/fluent-tester/src/E2E. This is to create a sophisticated, in-depth testing infrastructure that ensures that we don't regress our component library in the future; giving our partners and customers the best experience possible. Please see [Authoring an E2E Test](https://github.com/microsoft/fluentui-react-native/tree/main/apps/E2E#authoring-e2e-test).**

Reach out to Samuel Freiberg with any questions related to E2E testing.

### Adding the JS source code to your component

1. Create a `src/` subdirectory in your component directory with a minimum of two files (listed below). You may optionally choose to subdivide your code however you wish; there are plenty of examples in the other components of FluentUI React Native.

   1. `index.ts`
      - This is the file listed as `main` inside your package.json and simply exports other files.
   1. `<new-component>.tsx`
      - This is the file that will actually define your function component, and compose it into a higher order component with slots, theming, and design tokens.
      - Note that we need the comment `/** @jsx withSlots */` at the top of this file. An explanation can be found in the comment at `packages/experimental/use-slots/src/withSlots.tsx`
   1. `<new-component>.<types | settings | platform | blah>.tsx` (Optional)
      - Optional extra files to subdivide your code however you see fit. You can also add platform specific files as you see fit.

### Adding a new test for your component to the test app

1. In FluentTester (our test app), we'll need to add an test component. The test components are located under `fluentui-react-native/apps/fluent-tester/src/TestComponents`.
1. Make a subdirectory for your new component at this path, as well as adding an entry for your test in `testPages.tsx` and `testPages.<platform>.tsx`
1. Create your tests in this new subdirectory. Pattern matching off an existing control's tests will greatly help.
1. If your component contains a native module, you will also need to add the path to your component's `podspec` (that we created earlier) in your test app's Podfile. This extra step is due to the fact that FluentTester has separate platform test apps that each share a common JS package. The react native community CLI does not support [autolinking transitive dependencies](https://github.com/react-native-community/cli/issues/1347), so we need to add it manually here.
1. Add your new module as a dependency in `apps/fluent-tester/package.json` and run `yarn && yarn build` from the root folder.
   1. If your component has native apple code, run `pod install` from the corresponding macOS or iOS test app folders (`apps/fluent-tester/macos` or `apps/fluent-tester/ios` respectively).
1. Run the test app and you should see your new test!

## Adding native code to your new component

Through the power of [Native Modules](https://reactnative.dev/docs/native-modules-intro), we are able to create components that are comprised of native platform code, rather than JS. This is particularly useful if you want platform specific behavior, or if you want a component that feels much more aligned to it's specific platform. The downside is you must implement the Native module for every platform you wish to support. It's worth investigating whether you truly need a native module, or if a more cross platform JS implementation is the better approach.

There are a few caveats to know of adding a native module to a FluentUI React Native component:

- Your component will probably only have one slot. We have not yet explored creating a native component with multiple re-composable slots, and have adopted the pattern of having one "root" slot that simply holds the native component
- Use `ensureNativeComponent` instead of `requireNativeComponent` to ensure the underlying native component is properly memoized and only imported once.
- You will need to decide what is a token and what is a property, and how you want to create your component's API surface and map it to the native view's API.
- If you want the default values of your component's props / tokens to come from the Native Module, you can use the `constantsToExport` API, and pass it to `slotProps` in your component. You can see an example of this in `experimental-avatar`.

## Creating new native apple components

This section is specifically focused on creating new components for Apple platforms. Most if not all of these are wrapped controls from [FluentUI Apple](https://github.com/microsoft/fluentui-apple).

If you are creating a new component from scratch (AKA your wrapped FluentUI Apple control currently has no analog in FluentUI React Native), you have the most leeway to design your API. In general, you will probably want to expose each property from the native swift control as either a token or prop (or both) to JS.

If you want to add a native implementation to an existing component, you may be better off making a duplicate "experimental" component that contains the native implementation, as using a Native Module limits you to one slot, where an existing JS component may have multiple slots. Examples of duplicate native implementation include "experimental-avatar" and "experimental-native-button".

An example of how we would create Shimmer with the compose framework if all the swift properties on the native control were tokens would look like so. This is how it's currently implemented

```
export type ShimmerTokens = {
  // add the native swift properties here
}
// the native control on the inside needs to receive these
export type NativeShimmerProps = ShimmerTokens & ViewProps;
// the shimmer control only should get these via customization
export type ShimmerProps = ViewProps
// tokensThatAreAlsoProps is false and can be omitted because nothing is shared
// type looks like this:
props: ShimmerProps;
slotProps: { root: NativeShimmerProps };
tokens: ShimmerTokens;
// buildProps would look like this:
root: buildProps(tokens => ({ ...tokens }), [])
// this is because the tokens aren't depending on any props
// which means they only change when the theme is updated
```

If instead, some of the native swift properties were tokens AND props, it would look something like this:

```typescript
const tokensThatAreAlsoProps: (keyof ShimmerTokens)[] = [/* list all the tokens here */];

// in the body of the component then add
tokenProps,

// then buildProps becomes:
  root: buildProps(tokens => ({...tokens}), tokenProps)

```

To add a native module that wraps a FluentUI Apple control:

1. Create a `podspec` file at the root of the your new component's directory.
   - This is the file cocoapods will read to figure out what native files to import when it compiles the client app that is using your component
   - We can read the metadata from our `package.json` (See the existing podspecs for how to do this)
   - We specify `MicrosoftFluentUI` as dependency, which ensures the source code for FluentUI Apple is pulled in while compiling this component. Consider using a subspec (i.e `MicrosoftFluentUI/Avatar_ios`) if possible.
1. Create the `ios/` and `macos/` subdirectories (whichever platforms you need) in your components directory
1. Inside each new directory you just created, you will have at a minimum of 3 files (2 if you skip Swift and only use objective c)
   1. `FRN<new-component>ViewManager.h / m`
      - This is the Objective-C file needed because Swift does not support macros and React Native requires them to map JS props to the native properties of the control. (Macros like `RCT_EXPORT_VIEW_PROPERTY` and `RCT_EXPORT_METHOD`). The .h file should at the minumum import `<React/RCTViewManager.h>`
   1. `<new-component>ViewManager.swift`
      - This Swift file imports FluentUI Apple, and creates a subclass of RCTViewManager to instantiate and return your FluentUI Apple control. Objective-C methods like `requiresMainQueueSetup` and `constantsToExport` can be overridden here. It's important to note that in order for properties and methods to be available to React Native, they must add the `@objc` decorator to it's declaration.

## Create new native Windows components

This section is specifically focused on creating new Windows components using React Native for Windows.

If you are creating a new component from scratch, you have the most leeway to design your API. In general, you will probably want to expose each property from the native WinUI control as either a token or prop (or both) to JS.

To add a native Windows module:

1. Follow [these instructions](https://microsoft.github.io/react-native-windows/docs/native-modules-setup#creating-a-new-native-module-library-project) for creating a new C++/WinRT native windows module library. Complete all steps through the end of [Making your module ready for consumption in an app](https://microsoft.github.io/react-native-windows/docs/native-modules-setup#making-your-module-ready-for-consumption-in-an-app).
   - When creating Views and ViewManagers for your module, Windows components such as Expander and Windows modules outside of the FluentUI React Native repository such as the [`datetimepicker`](https://github.com/react-native-datetimepicker/datetimepicker/tree/master/windows/DateTimePickerWindows) are helpful resources
2. Follow the steps for [creating a new component](#creating-a-new-component) in FluentUI React Native.
   - Other Windows components such as the Expander will be helpful with this step.
3. Copy the `windows` folder from the local native component library created in Step 1 into the root of the new componenet's directory.
4. Testing the component locally
   1. Follow steps for Option 1 of [testing the module](https://microsoft.github.io/react-native-windows/docs/native-modules-setup#testing-the-module-before-it-gets-published)
      - Be sure to run the autolinking command from the component's root directory (`npx react-native autolink-windows`)
   2. Check that the NuGet packages for the test application and component line up. i.e. If the component uses WinUI 2.6, the test application should as well.
      - Right-click on the solution within VS. Select `Manage NuGet Packages for Solution…`. Look at differences under the consolidate tab.
      - After this step, you may need to remove unused references for .xcsproj files
   3. Add your native module references within the `App.js` file.
      - `Import { NewComponent } from @fluentui-react-native/experimental-<new-component>;`
   4. Start metro via command line
      - Navigate to windows folder (`packages\experimental\<new-component>\windows`)
      - Run `yarn start`
   5. Run application

## Creating new native Android Components

This section is specifically focused on creating new components for Android platforms.

If you are creating a new component from scratch, you have the most leeway to design your API. In general, you will probably want to expose each property from the native Android control as either a token or prop (or both) to JS.

To add a new control to the FURN component library: [creating a new component](#creating-a-new-component)

To add a native module that wraps a FluentUI Android control:

1. Create the android/src/main/java/com/microsoft/fnandroid/<new-component> subdirectory in your components directory

2. Inside the new directory you just created, add the following files. In all of the newly created files, add your package name at the top of the file: package com.microsoft.fnandroid.(new-component)

   a. **(new-component)ViewManager.kt**: This Kotlin file imports FluentUI Android, and creates a subclass of RCTViewManager to instantiate and return your FluentUI Android control.

   - Implement the createViewInstance method

   - Expose view property setters using @ReactProp (or @ReactPropGroup) It's important to note that in order for properties and methods to be available to React Native, they must add the @ReactMethod decorator to it's declaration.

   b. **(new-component)Module.kt**: This file will contain your native module class. Your module class will extend the ReactContextBaseJavaModule

   c. **(new-component)Package.kt**

   - Add the ViewManager in createViewManagers of the applications package
   - Add the Module in createNativeModules of the applications package

3. In directory android/src/main, add AndroidManifest.xml and add the package name

4. Autolink Native Module

   a. Gradle Build Init plugin

   - Run gradle init inside android directory
   - Select type of project to generate: Basic
   - Select build script DSL: Groovy

   b. Include dependencies for android build environment

   - Edit the generated build.gradle file (Example: packages/experimental/Drawer/android/build.gradle)
   - Add dependencies for kotlin, maven, react-native, etc
     - Add dependency for FluentUIAndroid

   c. Add @fluentui-react-native/<new-component> package under "dependencies" and "depcheck"/"ignoreMatches" in apps/fluent-tester/package.json in order for our Fluent Tester app to build and use your new Android component module

## Creating a pull request

Thanks for your interest in contributing to the fluentui-react-native! We welcome all contributions. Here's information on how to prepare your change for a pull request.

### Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

### Prerequisites

#### Beachball

This repo manages semantic versioning and publishing using [Beachball](https://github.com/microsoft/beachball). When contributing, make sure to run the following before making a pull request:

1. `yarn change` will take you through a command line wizard to generate change files
2. Make sure to push the newly generated change file

#### Testing changes

Before you create a pull request, test your changes with the FluentUI Tester on the platforms that are affected by your change. For more information on the FluentUI Tester, please follow instructions in the [FluentUI Tester readme](./apps/fluent-tester/README.md).

#### Contributor License Agreement

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

### Additional Considerations

#### Update Documentation

We welcome having documentation for our packages and components! Please add or update any relevant documentation for your changes.

#### Accessibility

Please test your change for keyboard navigation as well as compatibility with Voiceover and screen readers.

#### Internationalization

Consider if your change needs to have special handling for right-to-left languages, or other internationalization considerations.
