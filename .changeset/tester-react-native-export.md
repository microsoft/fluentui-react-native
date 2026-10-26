---
'@fluentui-react-native/tester': patch
---

Point the `react-native` export condition at `./src/index.tsx`; it referenced `./src/index.ts`, which does not exist.
