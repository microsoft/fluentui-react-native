# Icon

- Staged component will be used for the Icon

1. Why two phase render?
   Maybe talk to Jason

virtual dom
render tree

## Background

# Framework

There's `compose` function under `@fluentui-react-native/framework`.
We generally refer to this as the `compose` framework.
This framework has built-in functionality for integrating a theme with a component to style it, and allows for extensibility of the created component using two additional functions, `customize` and `compose`, which you can call on the component to create a new component.

## Component Layering

Components are built in four main phases. They are:

1. _Settings_ - obtain and merge all the settings objects together, apply the overrides, and cache the result.
1. _Tokens_ - turn the various tokens set via the settings phase or via the user props into styles, merge everything together and cache the result.
1. _Finalization_ - do custom processing on highly variable props. Things such as the text value for a label will be different for every instance of the control, these should just be applied directly.
1. _Render_ - render using the props prepared in the above steps

The following diagram shows what this might look like for a base or composed control. Note that when composing a control not everything needs to be specified, if things are unspecified the new component will just use the functionality from the parent control.

![Component Layering Diagram](./ComponentLayering.png)

It's also worth mentioning that these steps are optional. If a component has no tokens, then token processors need not be defined. Similarly if there are no settings to obtain the settings may return an empty result.

## Key concepts of the framework

### Slots

The "Slot" pattern is an abstraction pattern used to compose higher order components. The pattern allows us to divide the props of one component into multiple "slots". An individual slot represents your inner component, in essence the actual entries that you will put in your render tree. Using the slot pattern lets you abstract away specifically what gets rendered in the tree and in advanced user scenarios allow you to switch out or flatten slots. For example, you might choose to replace whatever we put in the default "icon" slot for a button with an SVG, or a spinner. You could replace the root slot of a radio group with a focus trapzone if the radio button is a required part of the form. The props are assigned to whatever happens to get rendered for that slot. It is also built to help with style creation for the slots to help keep object references to the produced style objects consistent and use cached results where possible.

One caveat is that if a component simply wraps a single native component, then it only has one slot.

### Tokens

FluentUI React Native uses the design token system to handle styling / customization. There's extended [documentation](./packages/deprecated/foundation-tokens/README.md) about this in the repo, but here is a simple overview.

**Tokens** are things you set at design time, via theme, or via customizing the control. An example might be "brandColor", where each app has it's own color token it sets on all if its controls.

**Props** are just normal properties that you can set on a JSX element. An example might be "isAnimating".

Tokens can also be props (which is specified in the compose framework with the "TokensThatAreAlsoProps" field of the control)
Tokens help us achieve simpler customization for complex higher order components, and also help with memoization (AKA rendering the minimal set of changes every time the component is re-rendered).

---

# Why we use framework

The foundation-compose package defines a pattern for building performant components which can be easily customized and composed. By making customization easy and efficient, complex customization scenarios can be handled by creating new variants of controls instead of adding complexity to the props interface.

Controls should be:

- **Simple to Use** - The expected styling information for the theme should be loaded automatically, easy points of customization should be exposed in the props interface, rather than encouraging users to modify the style directly.
- **Cacheable** - Common resolutions for the control styling should be cached such that multiple instances of the same control type should share much of the logic.
- **Customizeable via Composition** - Complex customization should be achievable by composing new overrides with an existing control, without adding additional overhead and without breaking cacheability.

This infrastructure builds upon a number of key concepts.

# Framework structure

## Staged component

Most components should use the compose framework as it offers the comprehensive set of patterns like tokens and slots, but if you're creating a simple component that doesn't require those patterns, there's a lighter pattern called [stagedComponent](./packages/framework/use-slot/src/stagedComponent.ts). The stagedComponent pattern splits up the render function into two stages. Stage 1 handles building props and hook calls (best to separate the hook calls from the render tree since they rely on call order). Stage 2 returns the actual element tree, any conditional branching should happen here (Icon is a good example of using stagedCompoenent).

The final rendering of the props in a staged render. This is the function component signature that matches that of

- React.createElement, children (if present) will be part of the variable args at the end.
  /\*\*

* This is a pattern of rendering where a functional component can be executed in two stages rather than in a single pass.
*
* The pattern looks like:
* (props) => {
* // handle props
* // call hooks, remember these can't be conditional
* // build styles and props to pass to child components
*
* return (additionalProps, ...children) => {
*     // return the actual element tree, this includes conditional branching or rendering
*     // mixin additional props, props which require logic should be required in phase 1.
*
*     // NOTE: This is where children will show up
* };
* }
  \*/

### Common Caching

Implementation of a caching layer requires optimizing to increase the number of successful cache retrievals. This means that cache memoization needs to be optimized around properties and customizations that are common across usages.

Ideally produced styles come directly from the caches. This ensures that the controls don't end up with extraneous re-renders for sub-components. Because style is an object, it is compared with an identity check by the framework. This means that dynamic recomputation will always cause re-renders. This object identity check causes many seemingly simple usages of style to be problematic. As an example:

    // always re-renders
    <MyComponent style={{backgroundColor: 'blue'}}>

    // always re-renders if _style is defined inside the function itself, will not always re-render
    // if _style is defined outside the component.
    const _style={backgroundColor: 'blue'};
    <MyComponent style={_style}>

This is one of the things the react-native style sheet functionality strives to address.

# Composable - un-opinionated and composable base components

This package provides a framework for writing unopinionated functional components that can easily be extended to inject styling, and composed together in an efficient manner.

This provides a foundation for writing both simple and higher order components with the following characteristics:

- **Unopinionated** - Components can be written such that they encapsulate the core functionality of a component, without having opinions on what styling system to use. There are myriad styling systems and all involve tradeoffs between flexibility, simplicity, and performance. Writing components which allow injection of a styling system allows consumers to optimize for their scenarios.
- **Reusable** - Modern practice in react encourages making functionality reusable via hooks. This framework provides a standardized pattern for hooks and how their results are communicated to the actual rendering. This allows replacing or augmenting either the hook or rendering portions without the need of writing everything from scratch.
- **Customizable** - Typical customization patterns involve either passing customizations via props, or customizing via wrapping. Passing customizations via props explode the complexity of the props and cause issues with cacheability and performance. Wrapping components adds additional layers to the react hierarchy and still precludes access to internals of the component.
- **Composable** - This framework provides a repeatable pattern which allows for a wrapped component, or a part of a higher order component, to be executed functionally without adding extra layers to the react hierarchy.
- **Scalable** - Composable components can be used for both simple and higher order components. The framework uses the concept of slots to make targeting and customizing sub-components easier.
- **Flexible** - This pattern is suitable for use with both react and react-native. None of the concepts are platform specific.

## How it all works

The overall flow of a component can be seen in the following diagram. At its core, a functional react component takes in a set of props, and outputs a JSX.Element tree.

Using composable, the normal flow is broken into two primary parts: `usePrepareProps` and `render`. The optional `useStyling` function allows for style injection, while the `slots` define the actual JSX.Elements that will be output.

### How Slots work

The `Slots` parameter passed to `render` is an object containing functions which mimic the shape of `React.createElement`. When used with the @jsx helper `withSlots`, These functions:

1. Are created once. This is essential because creating a new closure on every render pass will cause the tree to remount. They are stored in a state hook but then never updated over the lifetime of the component.
1. Include references to the `slotProps` returned as part of `usePrepareProps`. This allows for filters to act upon the props and avoids having to manually write `<Slot.root {...slotProps.root}>` every time. It also allows additional props to be mixed in directly to the JSX tree with the merge happening implicitly before render.
1. Calls `composable.render` directly without going through `React.createElement`. This means that it will not create an unnecessary entry in the element tree. The `composable.usePrepareProps` will have been called as part of the parent component's prop preparation pass.
1. Can be used conditionally. Because hooks will be done as part of the `usePrepareProps` pass, the actual render itself will be safe to be used conditionally, even when being called as a function.

### Handling children

Because of the slot behavior a sub-component may or may not have children set during `usePrepareProps`. This is because children can be filled in via props, or by construction of a JSX tree within a higher order component. Because the construction of the tree happens during `render`, children are not reliably available until `render`.

### Tokens

A token property is a semantic representation of a style property, generally exposed on a higher order component's props interface. This allows a consumer of a control to customize the bits of the style directly, without needing to understand the details of the implementation.

Consider the example of a button, which at its most simple may have a layout element such as a View, a Text element, and an Icon element. Authoring style properties directly has a number of issues:

- If the implementation changes, either via a rename or a structural change, there is no guarantee customizations will continue to work.
- If the button is customized to have a primary label and a caption, if a text style was applied directly to the label, the caption would be unaffected.
- More complex implementations will likely be built on top of a base implementation. Things such as split buttons, menu buttons, toggle buttons are all variations where it is desireable to keep the complexity out of the root implementation.

As a general principle, separating the intent from the implementation is good design practice.

# @fluentui-react-native/composition

This package contains the component factory for all components created using the `compose` function under `@fluentui-react-native/framework`. We generally refer to this as the `compose` framework. This framework has built-in functionality for integrating a theme with a component to style it, and allows for extensibility of the created component using two additional functions, `customize` and `compose`, which you can call on the component to create a new component.

The component factory takes in a set of options. The options object allows the component's author to define a component's [slots](../../../CONTRIBUTING.md#slots), how the props for those slots are calculated, additional states of the component (such as hovered, pressed, or selected), the component's [tokens](../use-tokens/README.md) and their default values, and the component's render function.

## Customize

The `customize` API is used to modify the tokens that are part of the component. [Tokens](../use-tokens/README.md) control aspects of style of the component. Each control has some default value for its tokens, and these values may change based on states the control has. `Customize` allows you to change what the value of the tokens are by default or for specific states of the component. Each state of a component has an entry in a component's token set with the type `TTokens` which can be modified to set the tokens for that state. `Customize` can be used to create multiple different overrides of the same component, which allows for greater flexibility over [using the `components` property on the `Theme` object](../../../docs/pages/Theming/CustomTheme.md#components) to customize your components. The `customize` API will take in args of type `TokenSettings<TTokens, TTheme>`.

NOTE: Do not use this function to create a component inside a render function, otherwise the customized components will be recreated on each render.

Examples:

```ts
import { Theme } from '@fluentui-react-native/framework';

const CustomButton = Button.customize({
  iconSize: 10,
  spacingIconContentBefore: 10,
})

<CustomButton>Button with small icon and large gap between icon and label</CustomButton>

const CustomHoverButton = Button.customize({
  hovered: { backgroundColor: 'pink' },
})

<CustomHoverButton>Button with pink background on hover</CustomButton>

const CustomThemeButton = Button.customize((t: Theme) => ({ tokens: { backgroundColor: t.colors.neutralBackground1 }}));

<CustomHoverButton>Button uses theme entries for customization</CustomButton>
```

## Compose

The `compose` API on the component is used to modify the options fed into the `compose` API which builds the component. Notably this can be used to change the [slots](../../../CONTRIBUTING.md#slots) of a component or the functions which build the prop objects of the slots of the component, allowing for customizability of individual portions of the component. It can also allow for changes to the `render` function of the component, or which `states` get applied to the component. The compose function takes in an object of type `Partial<ComposeFactoryOptions<TProps, TSlotProps, TTokens, TTheme, TStatics>>`.

NOTE: Do not use this function to create a component inside a render function, otherwise the composed components will be recreated on each render.

Examples:

```ts
import { Theme, buildProps } from '@fluentui-react-native/framework';

const CustomText = Text.customize({ fontSize: 'header', color: 'hotpink' });
const ComposedButton = Button.compose({
  slots: {
    root: View,
    icon: Icon,
    content: CustomText, // changed the content slot to use large hotpink text component
  },
  slotProps: {
    content: {
      // Change the style prop of the content slot to only style margins, dropping styles from tokens.
      style: { marginTop: -1, marginBottom: 1, marginStart: 0, marginEnd: -2 },
    },
    root: buildProps(
      (tokens: ButtonTokens, _theme: Theme) => ({
        style: {
          backgroundColor: tokens.backgroundColor,
        },
      }),
      ['backgroundColor'], // key used for caching
    ),
  },
});
```
