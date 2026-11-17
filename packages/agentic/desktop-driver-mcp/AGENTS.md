# Desktop Driver MCP compatibility shim

This deprecated package forwards its existing driver-only APIs and executable to
`@fluentui-react-native/desktop-mcp`. It defaults to `agent-connection.json` and must never expose workload authority
or silently change discovery mode. The implementation and validation rules live in
`@fluentui-react-native/desktop-mcp/AGENTS.md`; see this package's [reference index](references/README.md) for migration.

Run this package's format, lint, build, and test scripts and add a patch changeset for published changes.
