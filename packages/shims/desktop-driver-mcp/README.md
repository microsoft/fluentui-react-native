# @fluentui-react-native/desktop-driver-mcp

**Deprecated:** use `@fluentui-react-native/desktop-mcp` instead.
This compatibility shim forwards to that package in driver-only mode.
Its `desktop-driver-mcp` executable, public embedding APIs, `--descriptor`, `--root`, and default
`agent-connection.json` discovery remain available. It does not expose workload tools.

## Migration

Replace the old dependency with `@fluentui-react-native/desktop-mcp`:

```sh
npm uninstall @fluentui-react-native/desktop-driver-mcp
npm install --save-dev @fluentui-react-native/desktop-mcp
```

In MCP server configurations, replace the `desktop-driver-mcp` command with `desktop-mcp` and add `--driver-only`.
Keep existing `--descriptor` and `--root` arguments; driver-only mode preserves `agent-connection.json` discovery.
For embedding, change imports to `@fluentui-react-native/desktop-mcp`; `connectWithDescriptor` and
`createDesktopDriverMcpServer` remain available with the same driver-only behavior.

Use `desktop-mcp` without `--driver-only` with a supervisor descriptor to enable managed workloads instead.
See `@fluentui-react-native/desktop-mcp/references/connection.md` and
`@fluentui-react-native/desktop-mcp/references/tools.md`. Agents start at [AGENTS.md](AGENTS.md).
