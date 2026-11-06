---
'@fluentui-react-native/desktop-test': patch
'@fluentui-react-native/storybook-desktop': patch
---

Run installed SIGTERM handlers when a parent lifeline stops a child without
disposers, so Windows children flush their report terminal before exiting.
Give the first manifest-backed smoke story a cold-bundle render budget, and
stop every owned smoke process before reporting a service cleanup failure.
