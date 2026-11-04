---
'@fluentui-react-native/storybook-desktop': patch
---

Add `driver --agent` (with `--descriptor` and `--root`), which protects the embedded Desktop Driver, publishes an agent connection for the Desktop Driver MCP adapter, disables the channel's unauthenticated MCP endpoint, and keeps the macOS application lease current. `desktop-test serve --agent` now works for Storybook targets and reports readiness in structured output modes.
