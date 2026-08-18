# FocusZone

## Purpose

FocusZone is an unstyled native primitive that coordinates directional and Tab
keyboard navigation among focusable descendants. It remains a standalone package
because it owns native macOS code and CocoaPods integration.

## Contract

- `FocusZoneProps` extends React Native `ViewProps` with directional, circular,
  Tab, disabled, and default-tabbable-element behavior.
- `defaultTabbableElement` accepts a React component ref or registered native
  identifier.
- `componentRef` exposes the native view, including its `focus()` method.
- Children, accessibility props, test props, native events, and caller styles are
  forwarded without theme tokens or appearance defaults.
- `isCircularNavigation` maps to the native `NavigateWrap` end behavior; otherwise
  navigation stops at the ends.

## Platform behavior

- macOS includes both the existing Paper view manager and a package-owned Fabric
  component view. Both reuse the same `RCTFocusZone` navigation implementation.
- Windows includes a package-owned Fabric component view that coordinates
  directional, Home/End, Tab, and focus-restoration behavior through RNW
  `ComponentView` focus APIs.
- Win32 continues to use its platform-provided native FocusZone implementation.
- Unsupported behavior remains platform-defined rather than being simulated in
  JavaScript.

## Compatibility

`FocusZoneState`, `FocusZoneTokens`, `FocusZoneSlotProps`,
`FocusZoneRenderData`, and `FocusZoneType` remain as deprecated compatibility
types.

## Demonstration

Interactive directional, circular, Tab, disabled, and default-focus scenarios
are colocated in `src/FocusZone.stories.tsx`.
