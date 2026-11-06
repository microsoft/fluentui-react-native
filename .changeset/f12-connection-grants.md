---
'@fluentui-react-native/desktop-driver': patch
'@fluentui-react-native/desktop-driver-mcp': patch
---

Separate driver, declared-workload, and recovery grant scopes. Add bounded,
attenuated connection principals and awaitable descendant revocation with
retryable terminal-only cleanup proof. Isolate MCP sessions per connection and
keep descriptor credentials out of diagnostics.
