---
'@fluentui-react-native/framework-base': patch
---

Clear React Native macOS's focused-input record when a focus target blurs or
detaches. A View focused through `requestFocus()` previously stayed recorded
after unmounting, so a later ScrollView touch dispatched `blur` to the removed
view and raised a Paper exception.
