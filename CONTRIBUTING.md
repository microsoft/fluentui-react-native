# Wrapping FluentUI Apple Controls in FluentUI React Native

## Pre-requisites

This guide assumes you:

- Are familiar with Objective C / Swift programming
- Have read through the [React Native Docs](https://reactnative.dev/docs/). In particular:
  - Understand classes vs function components (we use the latter) and [hooks](https://reactjs.org/docs/hooks-intro.html). Here's a good [video](https://www.youtube.com/watch?v=dpw9EHDh2bM) that explains function components and hooks for traditional OOP developers.
  - Understand [Native Modules](https://reactnative.dev/docs/native-modules-ios).
- Have a local fork of FluentUI React Native and have run the test app.

## Random info related to FluentUI React Native needed for this guide

Here I list a lot random concepts / info about specifics to FluentUI React Native. This is by no means that organized, and I'm happy for this info to be split out / moved around.

### Experimental vs component directory

There are two directories where components exist, the normal `packages/components` and `packages/experimental`. In general, the `experimental` directory is where components and frameworks we are iterating on get placed. It was originally created when we wrote the Compose V2 framework, and wanted to create duplicates of existing components in a different location so we could A/B test.

### Old Framework vs new Framework (Compose V2)

There's [documentation](https://github.com/microsoft/fluentui-react-native/tree/master/packages/components) for how to author a control, specifically with their two frameworks [foundation-compose](https://github.com/microsoft/fluentui-react-native/tree/master/packages/framework/foundation-compose) and [foundation-composable](https://github.com/microsoft/fluentui-react-native/tree/master/packages/framework/foundation-composable). Since that documentation was written, we have written a new component framework (PR's [here](https://github.com/microsoft/fluentui-react-native/pull/335) and [here](https://github.com/microsoft/fluentui-react-native/pull/400)) at `packages/experimental/framework` that is simpler/easier to use, and is the new preferred way to create components. Components that use this new framework are located at `packages/experimental` and are copies of the controls located at `packages/components` which still uses the old frameworks. Any new components should use the new framework. The old documentation is still good to read, specifically for using foundation-compose, as a lot of it applies to the new component.

### Slots

React likes to have higher order components where the one big "outer" component is composed of a a bunch of inner components. FluentUI React Native decided to handle the creation of components like this with the concept of Slots, where each slot is an abstract representation of one inner component.

When I asked Alicia and Jason "What are Slots?" I got these answers

```
Alicia:
I guess the way I'd explain it is that they abstract away specifically what gets rendered in the tree and in advanced user scenarios allow you to switch out or flatten slots.  For example, you might choose to replace whatever we put in the default "icon" slot for a button with a SVG, or a spinner.  You could replace the root slot of a radio group with a focus trapzone if the radio button is a required part of the form.  The props are assigned to whatever happens to get rendered for that slot.

Jason:
In terms of slots, that is a concept adapted from Fabric/Fluent.
The slots represent your inner components, in essence the actual entries that you will put in your render tree
This means if all you have is a component that wraps a single native component, then it only has one slot.
 - The framework allows for these components to be customized and swapped out one to one without fully rewriting the control
  - It is also built to help with style creation for the slots to help keep object references to the produced style objects consistent and use cached results where possible.
Is this component simply wrapping the native component 1 for 1? If so you might only want to use part of the framework. If this is a direct native component wrapper you may want to emulate what I do for Callout.
```

Currently, we have only explored having one slot that represents the native component for wrapped FluentUI Apple components. Shimmer is an example of only having one slot ("root") that is the native view, and the minimum set of things you need to do to get that working.

### Tokens

FluentUI React Native (and eventually all of FluentUI) uses the design token system to handle styling / customization. This seems to be inspired by [Adobe Design Tokens](https://spectrum.adobe.com/page/design-tokens/). There's [documentation](https://github.com/microsoft/fluentui-react-native/blob/master/packages/framework/foundation-tokens/README.md) about this in the repo, but I'll try to give a simple overview.

**Tokens** are things you set at design time, via theme, or via customizing the control. An example might be "brandColor", where each app has it's own color token it sets on all if it's controls

**Props** are just normal properties that you can set on a JSX element. An example might be "isAnimating".

Tokens can also be props (which is specified in the compose framework with the "TokensThatAreAlsoProps" field of the control)
Tokens help us achieve simpler customization for complex higher order components, and also help with memoization (AKA rendering the minimal set of changes every time the component is re-rendered)

## Creating a new component package

This section covers creating and adding a new component package to FluentUI React Native's monorepo. If you are instead working on an existing component and adding a native module, skip to the next two sections.

1. Create a new directory in of these two locations, depending on your component:

   - `fluentui-react-native/packages/components/<new-component>`
   - `fluentui-react-native/packages/experimental/<new-component>`

1. Copy the files from the top level of another component (A good example of this is the Shimmer). Make sure to empty the changelog file, and modify the name of the component where appropriate
1. Update your `package.json` file. This defines the name / fields of the npm package that will be published for this component.
1. As a pattern, we prefix `experimental` components with the word "experimental". For example, we have `@fluentui-react-native/experimental-avatar`

## Adding the JS source code to your component

1. Create a `src/` subdirectory in your component directory, with a minimum of two files. You may optionally choose to subdivide your code however you wish, there are plenty of examples in the other components of fluentui-react-native.

   1. `index.ts`
      - This is the file listed as `main` inside your package.json and simply exports other files.
   1. `<new-component>.tsx`
      - This is the file that imports your native view, and composes it into a component with slots, a theme, and design tokens.
   1. `<new-component>.<types | settings | platform | blah>.tsx` (Optional)
      - Optional extra files to subdivide your code however you see fit. You can also add platform specific files as you see fit.

There are a few caveats to know:

- Your component will probably only have one slot. We have not yet explored creating a native component with multiple re-composable slots, and have adopted the pattern of having one "root" slot that simply holds the native component
- Use `ensureNativeComponent` instead of `requireNativeComponent` to ensure the underlying native component is properly memoized and only imported once.
- You will need to decide what is a token and what is a property, and how you want to create your component's API surface and map it to the native view's API.
- You'll also want to grab whatever constants you need exported from the native control (default colors and hardcoded sizes for example) from the native control using the Native Module "constantsToExport" API, and pass it to the JS component in the `slotProps` section. We have an example of this in `experimental-avatar`. This may change as we add support for an Apple theme and can grab constants directly from the theme.

### Creating a new component from scratch

If you are creating a new component from scratch (AKA your wrapped FluentUI Apple control currently has no analog in FluentUI React Native), you have the most leeway to design your API. In general, you will probably want to expose each property from the native swift control as either a token or prop (or both) to JS.

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

```
const tokensThatAreAlsoProps: (keyof ShimmerTokens)[] = [/* list all the tokens here */];

// in the body of the component then add
tokenProps,

// then buildProps becomes:
  root: buildProps(tokens => ({...tokens}), tokenProps)
```

### Adding a native module to an existing component

TBD, since I haven't actually done this yet.

Depending on the complexity of adding a platform specific version of the control, it may be useful to make a copy of the control in `packages/experimental/`. The purpose of that space was to be a testing bed for new controls / frameworks. It also happens to be there the controls with the latest "compose" framework are implemented, which is the framework we want to follow.

We will probably make use of the "Platform.OS" check more often than adding platform specific tsx files, to keep as many similarities as possible.

## Adding Apple platform specific code to the package

1. Create a `podspec` file at the root of the your new component's directory.
   - This is the file cocoapods will read to figure out what native files to import when it compiles the client app that is using your component
   - We can read the metadata from our `package.json` (See the existing podspecs for how to do this)
   - We specify "MicrosoftFluentUI" as dependency, which ensures the source code for FluentUI Apple is pulled in while compiling this component.
1. Create the `ios/` and `macos/` subdirectories (Whichever platforms you need) in your components directory
1. Inside each new directory you just created, you will have at a minimum of 3 files (2 if you skip Swift and only use objective c)
   1. `<new-component>-Bridging-Header.h`
      - This file allows your swift files to import/read React Native objective C headers. At a minimum, we need `<React/RCTViewManager.h>`
   1. `<new-component>ViewManager.swift`
      - This Swift file imports FluentUI Apple, and creates a subclass of RCTViewManager to instantiate and return your FluentUI Apple control.
      - You can also overload the "constantsToExport" method to grab default values like colors and sizes to pass to JS.
   1. `MSF<new-component>ViewManager.m`
      - This is an extra objective c file needed because Swift does not support macros, and React Native requires them to map JS props to the native properties of the control. (Macros like `RCT_EXPORT_VIEW_PROPERTY` and `RCT_EXPORT_METHOD`)

## Adding a new test for your component to the test app

1. In the fluentui-react-native test app, we'll need to add an example test app. The test app code is located under `fluentui-react-native/apps/fluent-tester/src/RNTester`.
1. Make a subdirectory for your new component at this path, as well as adding an entry for your test in `Tests.tsx` and `Tests.<platform>.tsx`
1. Create your tests in this new subdirectory. Pattern matching off an existing control's tests will greatly help.
1. You will also need to add the path to your component's `podspec` (that we created earlier) in your test app's Podfile. This is a bug that we should eventually fix.
