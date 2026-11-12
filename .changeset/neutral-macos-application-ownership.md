---
'@fluentui-react-native/desktop-driver': patch
'@fluentui-react-native/desktop-test': minor
'@fluentui-react-native/storybook-desktop': patch
---

Add opt-in neutral macOS supervisor-owned application launch, exact kernel
incarnation attach and cleanup, and cross-helper application exclusion. Record
pending and acquired applications as workload claim resources, including
uncontained launches and uncertain failures.

Workload claim schema 3 uses the driver's OS process identity instead of an
uptime-derived wall-clock estimate. Legacy or unverified identities remain
unknown during inspection. `claimDesktopWorkload` now returns a promise and
must be awaited; the Storybook integration awaits it before starting.

Pre-spawn and rejected LaunchServices acquisitions release their claims.
Dispatched or surviving acquisitions remain fenced, and non-contention lock
failures clean up only the exact application that the helper launched.

Read-only macOS application identity inspection shares descriptor verification
without acquiring a controlling lease or disturbing session window records.
Storybook bridge-epoch recovery uses it on the embedded helper while real
launch/attach operations retain cross-service exact-incarnation exclusion.
