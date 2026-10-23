---
id: native-core.modern-components
kind: instruction-reference
owner_paths:
  - packages/agentic/native-core/src/components
  - packages/agentic/native-core/macos/components
  - packages/agentic/native-core/windows
---

# Modern components

The `macos` and `windows` entry points expose React 19 modern `Callout` and `FocusZone` previews, live native targets,
and typed operation outcomes. The `win32` entry point exposes constrained adapters over the Office host's legacy
registrations. Each component's `SPEC.md` is its contract; this reference summarizes cross-platform behavior and
qualification.

```tsx
import { Callout, FocusZone, useNativeViewTarget } from '@fluentui-react-native/native-core/macos';
// Windows uses the equivalent /windows entrypoint.
```

These previews require React 19 and the current native-core registration.
`useNativeViewTarget` supplies a passive live callback binding; attach its
`ref` to a materialized native View. Rect/point anchors use local logical
coordinates relative to such a live owner, not global screen coordinates.

Callout's ref is an opaque-presentation command handle; `content.ref` is the
actual View ref. Controlled `open` is requested presence, and physical native
closure latches the generation until false-to-true or a changed
`presentationKey`. `onReady` is separate from legacy `onShow`. FocusZone
preserves its actual native root `ref` and publishes confirmed requests through
`commandsRef`. Neither ref assignment nor a void native focus return is
confirmation. Requests support abort and timeout, and reject stale lifetimes.

## Focus requests and dismissal

The October 16, 2026 popup prerequisites extend modern Callout's
`requestFocus(presentation, target, options)` with `first` and `last` strategies.
They use the same native eligibility and actual-focus confirmation as
FocusZone; an empty search reports `not-mounted` so a consumer can explicitly
request its own focusable fallback. Native dismissal distinguishes `escape`,
`outside-pointer`, and `application-deactivated` where the observing branch can
identify them, while retaining `native-light-dismiss` for unclassified events.
Duplicate closure and late readiness cannot revive a dismissed presentation.
Rebuild native hosts for the extended command schema; `/legacy` is unchanged.

## macOS popups

The October 19, 2026 Popover amendments (see the Callout `SPEC.md`) change only
modern presentations on macOS. The popup window is transparent with no `.menu`
vibrancy backdrop, so the content View draws the visible surface. The window
shadow follows that content and is refreshed after content changes. Pointer input
on a live view anchor no longer light-dismisses, and the popup derives its own
Tab key-view loop. Paper also orders `requestFocus`, `close`, and `reposition`
after previously committed view updates. Legacy presentations and the
`focusWindow`/`blurWindow` commands are unchanged. macOS Fabric and Paper pass
14 modern Callout cases, 2 legacy Callout cases, and 19 shared-focus cases. The
window shadow was not captured visually because driver capture excludes shadows.

## Windows popups

On Windows Fabric, a modern popup window gets a DWM rounded corner and the
platform popup shadow, with no DWM border. A light dismissal from a press over
the live view anchor waits up to 250 ms for the anchor to receive that press,
so a trigger toggles its popup instead of reopening it. The owner-island pointer
handler ignores presses over the anchor. Windows passes all modern Callout
cases, including the anchor-press case, and all Popover stories.

## Win32 adapters

The `win32` `Callout` is a JavaScript adapter over the Office host's legacy
`RCTCallout` registration; it sends no new command to the prebuilt host. It
supports view anchors only. Its popup sits flush against the anchor, because
the host ignores `gapSpace`. The host draws the surface fill and corner radius,
because its layered window has no per-pixel transparency. By default the host
sets initial focus; `initialFocus: 'none'` leaves focus in place. `'last'`,
`close`, and `reposition` report `unsupported`. Unclassified host dismissals are
held for 250 ms so a trigger toggle can supersede them. Content events stop at
the popup boundary, because Win32 bubbles them through the React tree. A Tab exit
dismisses the outermost Tab-exiting presentation, and `continue` returns focus to
the view anchor, because the host cannot continue Tab past it. The `win32`
`FocusZone` adapter maps the modern props onto the host's `RCTFocusZone` and
confirms target and default focus from focus events; `'first'` and `'last'`
report `unsupported`. All Popover, Menu, MenuButton, and MenuItem stories pass on
Win32.

## Popup Tab navigation

The October 19 Menu family amendments add the modern `tabNavigation` prop. `cycle`, the default, keeps the popup
Tab order. `dismiss` and `continue` close the outermost Tab-exiting presentation in a popup ownership chain with
`tab-forward` or `tab-backward`, before any view handles the key. `continue` then focuses the key view after the view
anchor, or the anchor itself for Shift+Tab. Nested presentations anchored inside another modern popup are owned by
its window and close with it. macOS Fabric and Paper pass 16 modern Callout cases, including both Tab modes. Windows
routes Tab from a focused popup through a thread keyboard hook to the outermost Tab-exiting presentation and closes
nested popups with their owner; all Menu, MenuButton, MenuItem, Popover, and Callout stories pass on Windows.

## Qualification status

The Windows library builds with these additions, but its October 16 physical-input
cases skipped. On October 17, macOS Fabric and Paper qualified all 12 modern Callout
cases, including first/last search, empty refusal, explicit container focus,
view/rect/point geometry, dismissal/rearm, and flat Menu focus restoration.
Both renderers also pass 19 shared-focus cases without skips, including disabled
MenuItem activation refusal, read-only Input focus/edit refusal, Button disabled
state, and TabList selected-state updates. The strict Apple integration probe passes both React-module and
no-React-module bridging-header configurations. This is not an Office host
runtime qualification. See the [Win32 host follow-up](https://github.com/microsoft/fluentui-react-native/issues/4384)
for remaining gates.

Windows source/codegen and the native library build are qualified on RNW 0.81.35.
Modern FocusZone command/target-lifetime, legacy navigation, legacy and
modern Callout readiness, explicit operations, outside-input and Escape
dismissal, rearm, owner focus return, flat Menu composition, and 100% scale
anchor geometry pass on Windows. Win32 legacy FocusZone and legacy Callout
outside-click/recreate and Escape cases pass. Remaining Windows protocol
races are tracked in [#4374](https://github.com/microsoft/fluentui-react-native/issues/4374);
the DPI/RTL/scroll geometry, repeated-cycle resource, and assistive-technology
matrix is tracked in [#4375](https://github.com/microsoft/fluentui-react-native/issues/4375).
macOS Fabric and Paper pass the updated authored Callout and Menu composition
cases; this does not qualify the remaining geometry and accessibility matrix.
