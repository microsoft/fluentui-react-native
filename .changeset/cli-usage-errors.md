---
'@fluentui-react-native/desktop-driver': patch
'@fluentui-react-native/storybook-desktop': patch
---

Report desktop-driver CLI usage errors in every reporter mode. Subcommand usage errors now reach stderr (plain) or a single `error` record (json and ndjson) and exit 1 instead of exiting silently. An invalid `DESKTOP_REPORTER` no longer lets `serve` start. NDJSON failures emit the error record as their terminal record, matching JSON. WebDriver errors map to matching CLI error codes, and `doctor` messages are clipped.
