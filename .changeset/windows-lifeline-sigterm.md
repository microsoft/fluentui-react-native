---
'@fluentui-react-native/desktop-test': patch
'@fluentui-react-native/storybook-desktop': patch
---

Run installed SIGTERM handlers when a parent lifeline stops a child without
disposers, so Windows children flush their report terminal before exiting.
Give the first manifest-backed smoke story a cold-bundle render budget, wait
for authenticated runtime readiness before authored tests run in a relaunched
smoke `tests` phase, and stop every owned smoke process before reporting a
service cleanup failure.
