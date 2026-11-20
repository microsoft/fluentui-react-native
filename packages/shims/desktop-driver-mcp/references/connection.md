---
id: desktop-driver-mcp.connection
kind: instruction-reference
owner_paths:
  - packages/shims/desktop-driver-mcp
---

# Connection

`desktop-driver-mcp` retains driver-only discovery, including the default `agent-connection.json` record and existing
`--descriptor` and `--root` options. It forwards to the new adapter and never enables supervisor management.
See `@fluentui-react-native/desktop-mcp/references/connection.md` for discovery, migration, and lifetime semantics.
