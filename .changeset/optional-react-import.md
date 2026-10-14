---
'@fluentui-react-native/experimental-avatar': patch
'@fluentui-react-native/experimental-native-date-picker': patch
---

Import `React` in iOS Swift sources only when the module is available, so hosts can provide React Native headers through an Objective-C bridging header.
