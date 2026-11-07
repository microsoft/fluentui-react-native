---
'@fluentui-react-native/storybook-desktop': patch
---

Report `bridge-unavailable`, not `relaunch-required`, while a relaunched
runtime that has said hello awaits its initial `storyRendered`, so manifest
smoke readiness waits keep retrying instead of failing before any dispatch.
