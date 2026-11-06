---
'@fluentui-react-native/desktop-test': patch
'@fluentui-react-native/desktop-driver': patch
'@fluentui-react-native/storybook-desktop': patch
---

Share native service construction between the generic supervisor and Storybook
channel child, wiring private durable settlement recovery, exact application-exit
probes, protected descriptor lifetime and settled shutdown. Keep corrupt sibling
journal records fenced rather than allowing a valid record to mask uncertainty.
