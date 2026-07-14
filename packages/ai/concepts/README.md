# `@fluentui-react-native/concepts` package

This package contains core concepts for building fluent themed react-native controls. It should be of type module and only produce output to the lib directory. The contents will include:

1. **Concepts**: core concepts for use in the repository
2. **Types**: common type definitions, enums, and interface fragments used to standardize usage in the library.
3. **Instructions**: instructions for skills and agents for how analyze and validate types, and how to analyze controls.
4. **Metadata**: types and instructions for capturing information about a given component

## Main Concepts

There are several main concepts that should be defined here, with each concept potentially corresponding to a set of standardized props
and patterns for building components.

### Framework

- **v0** - the component is built with the legacy framework, generally using the routines from the packages under the @uifabricshared scope and packages/deprecated directory using the old style `compose` functionality.
- **v1** - the component is built against the newer framework, generally using the packages in the packages/framework directory.
- **none** - the component is not built using either framework and is a more traditional react-native component.
- **native** - the component is a native component

### Platform

Which native platform the component is supported on. One or more of: windows, macos, android, ios, win32

### States

States generally map to interaction patterns and sometimes standard prop patterns. Multiple states are often supported on the same component

- **disabled** - render the component using muted colors and disable interactions
- **hover** - handle mouse/pointer in/out, potentially changing visual states and sending events to control users
- **press** - handle press/click events
- **checked** - handle on/off state. This typically includes `checked` and `defaultChecked` props for the different behaviors.
- **focused** - the value is controlled by the system but typically has visual and accessibility changes.

### Appearance

One of the appearances supported by the library. Generally one of `default`, `primary`, `subtle`, `transparent` though there may be others. This is a baseline visual style with values
that will be modified by the various states.

### Size

One of: `small`, `medium`, or `large` with a typical default value of `small`. The values changed by changing the size should not be modified by state changes such as press or hover.

### Shape

Another visual only change that should be independent of state changes.

## Types

An enumerated string type should have:

1. A constant array such as: `const TYPE_NAME_VALUES = ['val1', 'val2'] as const;`
2. An exported type based on the enum like: `export type TypeName = typeof TYPE_NAME_VALUES[number];`
3. An exported type assertion helper called `isTypeName` that uses the constant array to validate the value is in bounds.

There should be standard props parts for the various appearance, size, shape, and states.

## Metadata

The component analysis skill will analyze packages and produce metadata about that component. This root of this should be the `ComponentMetadata` type that describes a component, how to construct it, what core concepts it supports, as well as what unique concepts it supports.

This metadata will be built and checked into the packages and exposed via the metadata exports entry.

The `ComponentMetadata` can be used to produce several output types:

- **`ComponentStates`** - a deterministic mapping of state combinations to props. These should be a sorted string record with the key being the combinations joined with dashes containing the props and interactions to set to simulate the output. Appearance should be treated as a root branch for visual states with the states like hover/checked/pressed applied on top.
- **`ComponentStyles`** - the style tree of a component, produced by the analyzer package as it is rendered across the various component states, with all unchanged values omitted for sub-states. This should also have all values coming from the theme resolved to their theme paths such as `theme.colors.neutralBackground1`.

Note that this is not complete by any means but is a baseline to get started.
