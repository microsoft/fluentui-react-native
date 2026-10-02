# Callout

## Purpose

Callout is an unstyled native primitive that presents children in transient UI
positioned relative to a target ref, registered native anchor, or anchor
rectangle. Its JS wrapper, native adapters, and codegen schema are owned by
`@fluentui-react-native/native-core`; the old Callout package is a JS-only shim.

The JavaScript component and its public types are exported only from
`@fluentui-react-native/native-core/legacy`, not the package root.

## Contract

- `CalloutProps` extends React Native `ViewProps` with target resolution,
  dismissal callbacks, and `componentRef`.
- `target` accepts a React component ref or registered native anchor string.
  When omitted, native positioning may use `anchorRect`.
- `componentRef` exposes `focusWindow()` and `blurWindow()`.
- Caller-supplied background, border, and dimension values are translated to
  native view style. User `style` is applied last.
- The primitive applies no theme tokens or visible appearance defaults.
  `position: 'absolute'` keeps popup content out of the parent page layout.
  Transparent colors and zero-width/radius values satisfy the macOS native
  layer contract when callers omit border and background props.
- Children, accessibility props, test props, native events, and supported
  Callout behavior props are forwarded to `RCTCallout`.

## Platform behavior

- macOS presents children in a native popup window and supports window focus
  commands through both Paper and Fabric component registrations.
- Windows uses native-core's Fabric registration for React Native Windows
  0.81 and newer. Native-core supplies no Windows Paper implementation.
- Win32 supplies the platform `RCTCallout` implementation and supports native
  dismissal, pointer capture, beak, and focus-restoration behavior.
- Unsupported native behavior remains platform-defined rather than being
  simulated in JavaScript.

## Compatibility

`ICalloutProps`, `ICalloutTokens`, and `CalloutNativeCommands` remain as
deprecated aliases for the public types in the legacy entrypoint.

Existing `Callout`/`RCTCallout` native registration names remain unchanged.
Native applications must directly depend on `@fluentui-react-native/native-core`
so native tooling discovers the shared pod and Windows project.

## Demonstration

Interactive scenarios live in
`apps/tester-core/src/TestComponents/Callout/CalloutTest.tsx`, with end-to-end
coverage under `apps/E2E/src/Callout`.
