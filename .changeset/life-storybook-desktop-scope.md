---
'@fluentui-react-native/storybook-desktop': patch
---

Leave an injected desktop-test service scope to its owner instead of closing it from `driver`, `server`, and the smoke lifecycle, which made a supervising `desktop-test serve` or story test wait on itself after a stop. Stage commands now receive the scope's cancellation signal. The CLI and the standalone Storybook channel keep their interrupt handlers until cleanup completes, handle SIGHUP, and force-stop owned commands on a second interrupt; an interrupted one-shot command reports `incomplete` instead of passed.
