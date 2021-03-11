# Contributing

## Pre-requisites

This guide assumes you:

- Have read through the [React Native Docs](https://reactnative.dev/docs/). In particular:
  - Understand classes vs function components (we use the latter) and [hooks](https://reactjs.org/docs/hooks-intro.html). Here's a good [video](https://www.youtube.com/watch?v=dpw9EHDh2bM) that explains function components and hooks for traditional OOP developers.
  - Understand [Native Modules](https://reactnative.dev/docs/native-modules-ios).
- Have a local fork of FluentUI React Native and have run the test app.

## Understanding the Repository Structure

There are some specific quirks to this repository that one should be familiar with.

### Old framework vs new framework (Compose V2)

There's [documentation](https://github.com/microsoft/fluentui-react-native/tree/master/packages/components) for how to author a control, specifically with the two frameworks [foundation-compose](https://github.com/microsoft/fluentui-react-native/tree/master/packages/framework/foundation-compose) and [foundation-composable](https://github.com/microsoft/fluentui-react-native/tree/master/packages/framework/foundation-composable). Since that documentation was written, we have written a new component framework (PR's [here](https://github.com/microsoft/fluentui-react-native/pull/335) and [here](https://github.com/microsoft/fluentui-react-native/pull/400)) at `packages/experimental/framework` that is simpler/easier to use, and is the new preferred way to create components. Components that use this new framework are located at `packages/experimental` and are copies of the controls located at `packages/components` which still uses the old frameworks. Any new components should use the new framework. The old documentation is still good to read, specifically for using foundation-compose, as a lot of it applies to the new component.

There are two directories where components exist, the normal `packages/components` and `packages/experimental`. In general, the `experimental` directory is where components and frameworks we are iterating on get placed.

## Understanding the framework

Our framework has a few key concepts that you should be familiar with.

### Slots

The "Slot" pattern is an abstraction pattern used to compose higher order components. The pattern allows us to divide the props of one component into multiple "slots". An individual slot represents your inner component, in essence the actual entries that you will put in your render tree. Using the slot pattern lets you abstract away specifically what gets rendered in the tree and in advanced user scenarios allow you to switch out or flatten slots. For example, you might choose to replace whatever we put in the default "icon" slot for a button with an SVG, or a spinner. You could replace the root slot of a radio group with a focus trapzone if the radio button is a required part of the form. The props are assigned to whatever happens to get rendered for that slot. It is also built to help with style creation for the slots to help keep object references to the produced style objects consistent and use cached results where possible.

One caveat is that if a component simply wraps a single native component, then it only has one slot.

### Tokens

FluentUI React Native (and eventually all of FluentUI) uses the design token system to handle styling / customization. There's extended [documentation](https://github.com/microsoft/fluentui-react-native/blob/master/packages/framework/foundation-tokens/README.md) about this in the repo, but here is a simple overview.

**Tokens** are things you set at design time, via theme, or via customizing the control. An example might be "brandColor", where each app has it's own color token it sets on all if its controls.

**Props** are just normal properties that you can set on a JSX element. An example might be "isAnimating".

Tokens can also be props (which is specified in the compose framework with the "TokensThatAreAlsoProps" field of the control)
Tokens help us achieve simpler customization for complex higher order components, and also help with memoization (AKA rendering the minimal set of changes every time the component is re-rendered).

## Creating a new component

This section covers creating and adding a new component package to FluentUI React Native's monorepo. If you are instead working on an existing component and adding a native module, skip to the next two sections.

1. Create a new directory in of these two locations, depending on your component:

   - `fluentui-react-native/packages/components/<new-component>`
   - `fluentui-react-native/packages/experimental/<new-component>`

1. Copy the files from the top level of another component (A good example of this is the Shimmer). Make sure to empty the changelog file, and modify the name of the component where appropriate.
1. Update your `package.json` file. This defines the name / fields of the npm package that will be published for this component.
1. As a pattern, we prefix `experimental` components with the word "experimental". For example, we have `@fluentui-react-native/experimental-button`.

### Adding the JS source code to your component

1. Create a `src/` subdirectory in your component directory, with a minimum of two files. You may optionally choose to subdivide your code however you wish, there are plenty of examples in the other components of fluentui-react-native.

   1. `index.ts`
      - This is the file listed as `main` inside your package.json and simply exports other files.
   1. `<new-component>.tsx`
      - This is the file that imports your native view, and composes it into a component with slots, a theme, and design tokens.
   1. `<new-component>.<types | settings | platform | blah>.tsx` (Optional)
      - Optional extra files to subdivide your code however you see fit. You can also add platform specific files as you see fit.

### Adding a new test for your component to the test app

1. In FluentTester (our test app), we'll need to add an test component. The test components are located under `fluentui-react-native/apps/fluent-tester/src/FluentTester/TestComponents`.
1. Make a subdirectory for your new component at this path, as well as adding an entry for your test in `Tests.tsx` and `Tests.<platform>.tsx`
1. Create your tests in this new subdirectory. Pattern matching off an existing control's tests will greatly help.
1. If you're component contains a native module, you will also need to add the path to your component's `podspec` (that we created earlier) in your test app's Podfile. This extra step is due to the fact that FluentTester has separate platform test apps that each share a common JS package. The react native community CLI does not support [autolinking transitive dependencies](https://github.com/react-native-community/cli/issues/1347), so we need to add it manually here.

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
   1. `<new-component>-Bridging-Header.h`
      - This file allows your swift files to import/read React Native objective C headers. At a minimum, we need `<React/RCTViewManager.h>`
   1. `<new-component>ViewManager.swift`
      - This Swift file imports FluentUI Apple, and creates a subclass of RCTViewManager to instantiate and return your FluentUI Apple control. Objective C methods like `requiresMainQueueSetup` and `constantsToExport` can be overridden here. It's important to note that in order for properties and methods to be available to react native, they must add the `@objc` decorator to it's declaration.
   1. `MSF<new-component>ViewManager.m`
      - This is an extra objective c file needed because Swift does not support macros, and React Native requires them to map JS props to the native properties of the control. (Macros like `RCT_EXPORT_VIEW_PROPERTY` and `RCT_EXPORT_METHOD`)/
