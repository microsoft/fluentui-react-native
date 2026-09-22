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
- With `tabKeyNavigation="None"`, Tab and Shift+Tab leave the zone. Backward
  traversal considers preceding elements and focusable ancestors, not the zone's
  descendants or later siblings, including when the zone is its parent's first
  child.

## Platform behavior

- macOS includes both the existing Paper view manager and a package-owned Fabric
  component view. Both reuse the same `RCTFocusZone` navigation implementation.
  Directional movement is geometric; `use2DNavigation` does not switch AppKit to
  the Windows linear mode. For example, Down from item 2 in a three-column grid
  moves to item 5.
- Windows includes a package-owned Fabric component view that coordinates
  directional, Home/End, Tab, and focus-restoration behavior through RNW
  `ComponentView` focus APIs. Backward zone exit walks reverse preorder and tests
  each visited node itself rather than searching an ancestor's entire subtree.
- Win32 continues to use its platform-provided native FocusZone implementation.
  Windows/Win32 use linear movement by default and opt into geometric movement
  with `use2DNavigation`.
- Unsupported behavior remains platform-defined rather than being simulated in
  JavaScript.

## Compatibility

`FocusZoneState`, `FocusZoneTokens`, `FocusZoneSlotProps`,
`FocusZoneRenderData`, and `FocusZoneType` remain as deprecated compatibility
types.

## Demonstration

Interactive directional, circular, Tab, disabled, and default-focus scenarios
live with the agentic primitive stories in
`packages/agentic/components/src/primitives/focus-zone/focus-zone.stories.tsx`.
The `FirstChildTabExit` native tests cover nested first-child containers with
later siblings and a preceding focusable subtree on all desktop endpoints.
They guard a Windows Fabric traversal defect; macOS uses its independent
AppKit key-view loop and shares the same outside-zone navigation requirement.
