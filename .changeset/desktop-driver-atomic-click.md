---
'@fluentui-react-native/desktop-driver': patch
---

Make Windows physical clicks robust to another absolute pointing device, such as a remote-desktop or virtual-machine
viewer, that moves the cursor back after injection. Pointer placement now confirms the cursor reached the target and
retries before pressing, element clicks inject the press and release as one coordinate-carrying batch, and pointer
actions carry their coordinate on every press and release. Previously such a device could redirect the press to its
own cursor position, activating another window and leaving text inputs unfocused.
