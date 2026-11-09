---
'@fluentui-react-native/desktop-test': patch
---

Report each command and step as a one-line outcome header with its duration and summary. Command output stays in its log and shows only when the step fails, in a verbose run, or inside a collapsed GitHub Actions group, and `runDesktopOperation` exposes the same headers to other producers. Neutralize workflow commands per line instead of wrapping every message in `::stop-commands::` fences, drop the per-message command identifiers, and remove the unused `@rnx-kit/reporter` dependency.
