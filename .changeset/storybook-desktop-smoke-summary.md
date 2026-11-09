---
'@fluentui-react-native/storybook-desktop': patch
---

Run story rendering and story tests as reported operations, so a smoke run shows one header with counts such as `209 stories rendered` and `101 of 101 story tests executed: 101 passed, 0 failed, 0 skipped`, and says `no story tests executed` when none ran. `--verbose` streams command output live; other runs keep it in the logs and show the end of a failing step's log.
