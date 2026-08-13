# Callout

## Purpose

Callout is an unstyled native primitive that presents children in transient UI
positioned relative to a target ref, registered native anchor, or anchor
rectangle. It remains a standalone package because it owns native code and
CocoaPods integration.

## Contract

- `CalloutProps` exposes the native view contract plus target resolution,
  dismissal callbacks, and `componentRef`.
- `target` accepts a React component ref or registered native anchor string.
  When omitted, native positioning may use `anchorRect`.
- `componentRef` exposes `focusWindow()` and `blurWindow()`.
- Caller-supplied background, border, and dimension values are translated to
  native view style. User `style` is applied last.
- The primitive applies no theme tokens or appearance defaults. Its only
  structural default is `position: 'absolute'`, which keeps popup content out
  of the parent page layout.
- Children, accessibility props, test props, native events, and supported
  Callout behavior props are forwarded to `RCTCallout`.

## Platform behavior

- macOS presents children in a native popup window and supports window focus
  commands.
- Win32 supplies the platform `RCTCallout` implementation and supports native
  dismissal, pointer capture, beak, and focus-restoration behavior.
- Unsupported native behavior remains platform-defined rather than being
  simulated in JavaScript.

## Compatibility

`ICalloutProps`, `ICalloutTokens`, and `CalloutNativeCommands` remain as
deprecated aliases for the modern public types.

## Demonstration

Interactive scenarios live in
`apps/tester-core/src/TestComponents/Callout/CalloutTest.tsx`, with end-to-end
coverage under `apps/E2E/src/Callout`.
