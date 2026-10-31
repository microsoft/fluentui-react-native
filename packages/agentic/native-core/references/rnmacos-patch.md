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

These fixes belong in RNmacOS, not in a MenuItem-specific native host or a
JavaScript accessibility-value workaround. The patch is used by this repository's
native hosts; publishing native-core or components does **not** install it in a
consumer. Its upstream replacement is a release gate tracked in
[remaining work](remaining-work.md#rnmacos-upstream-replacement).
