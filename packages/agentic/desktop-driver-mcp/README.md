# @fluentui-react-native/desktop-driver-mcp

**Deprecated compatibility shim:** this package forwards to `@fluentui-react-native/desktop-mcp` in driver-only mode.
Its `desktop-driver-mcp` executable, public embedding APIs, `--descriptor`, `--root`, and default
`agent-connection.json` discovery remain available. It does not expose workload tools.

Migrate to `desktop-mcp --driver-only` for equivalent behavior, or use `desktop-mcp` with a supervisor descriptor to
enable managed workloads. See `@fluentui-react-native/desktop-mcp/references/connection.md` and
`@fluentui-react-native/desktop-mcp/references/tools.md`. Agents start at [AGENTS.md](AGENTS.md).
