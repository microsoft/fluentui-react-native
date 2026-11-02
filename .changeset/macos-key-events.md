---
'@fluentui-react-native/interactive-hooks': patch
---

On react-native-macos 0.78 and later, `useKeyProps`, `useKeyDownProps`, and `useKeyUpProps` emit `keyDownEvents` and `keyUpEvents`, the same as on win32, instead of the deprecated `validKeysDown` and `validKeysUp`. react-native-macos 0.73 and 0.74 still get the legacy props.
