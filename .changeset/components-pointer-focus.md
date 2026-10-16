---
'@fluentui-react-native/components': patch
---

Use Framework Base's `pointerFocus` mode for Tab. FocusZone stories request
focus through focus targets so React Native macOS does not keep an unmounted
item as its focused input.
