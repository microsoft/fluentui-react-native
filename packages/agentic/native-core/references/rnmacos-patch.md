---
id: native-core.rnmacos-patch
kind: instruction-reference
owner_paths:
  - packages/agentic/native-core
  - .yarn/patches
---

# Repository-local RNmacOS patch

The root resolution pins RNmacOS 0.81.9 with
`.yarn/patches/react-native-macos-npm-0.81.9-aa583a0648.patch`. It reuses Paper's
native AX role converter for Fabric, projects disabled/selected/expanded state
onto the actual accessible element, removes the structural Fabric TextInput's
extra Tab stop, and separates read-only single-line editing from disabled state
on both renderers. Read-only editors remain selectable/focusable; disabled editors
remain disabled. It also maps their `textbox` role through the existing converter.
Fabric paragraphs (`<Text>`) set `accessible` now expose themselves as static
text on macOS. RNmacOS otherwise rejects them unconditionally because its iOS
element provider is compiled out, which hides every Text label and `testID`
from accessibility clients.

## Native-props synchronization backport

The root also applies
`.yarn/patches/react-native-macos-npm-0.81.9-native-props.patch`, a minimal
backport of MIT-licensed React Native code from
[upstream commit `923e7ddcaf4d` by OrfeasZ, #52646](https://github.com/facebook/react-native/commit/923e7ddcaf4d2de45ca7dedafbb84c6b87dbffc4).
The upstream copyright and license in the patched source files remain intact.
Fabric's window-resize layout can clone animated nodes on the main thread while
JavaScript replaces their `nativeProps_DEPRECATED` map. This concurrent-access
cause is inferred from the failing reader, the unguarded source, and the upstream
fix; no ThreadSanitizer run established the concurrent writer. The backport guards
both writers and the cloning reader with one family-owned mutex, copying the
props before releasing the lock and parsing them afterward. This preserves
merge precedence without holding the mutex across shadow-tree commits.
Regenerate Pods and clean-build all native dependencies after changing this
patch: the family header's layout changes.

The race was exposed by the PGB-006 NativeSemantics window-resize callback
during Fabric Storybook qualification. A clean native rebuild still failed,
and an owned-process AddressSanitizer report recorded
`BUS` in `folly::dynamic::type()` while `ShadowNode::clone` copied the
unprotected native-props map during AppKit layout. This is a renderer
concurrency fix, not a click-through or driver retry workaround. PGB-006 runs
in the full Fabric physical lane as well as the accessible lane; the original
Checkbox, keyboard-clear, and Accordion reproductions passed without this
backport.

### Qualification

A clean Pods and Fabric Storybook native build with AddressSanitizer passed,
as did the PGB-006 resize callback and Native Core's CocoaPods-module and
Office-style bridging-header probes. This qualifies the Storybook host only:
macOS FluentTester and other native application hosts were not built locally.

## Scope and replacement

These fixes belong in RNmacOS, not in a MenuItem-specific native host or a
JavaScript accessibility-value workaround. The patch is used by this repository's
native hosts; publishing native-core or components does **not** install it in a
consumer. Its upstream replacement is a release gate tracked in
[remaining work](remaining-work.md#rnmacos-upstream-replacement).
