---
'@fluentui-react-native/storybook-desktop': patch
---

Retire the old authenticated bridge when a reloaded runtime authenticates its
new socket before the old socket closes. Pending work on the old socket is
rejected with effect `unknown`, and the old socket cannot reclaim the bridge,
instead of the new hello being dropped and selections reaching the stale socket.
