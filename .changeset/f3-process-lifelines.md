---
'@fluentui-react-native/desktop-test': patch
'@fluentui-react-native/storybook-desktop': patch
---

Add cooperative owned Node service parent lifelines, explicit settled disposal,
and per-command correlated typed service readiness. Storybook agent startup no
longer treats a generated ready file as authoritative. Incomplete withdrawal or
stalled disposal stays failed and fenced; native survivor qualification remains
separate.
