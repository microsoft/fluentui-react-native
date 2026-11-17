# @fluentui-react-native/desktop-mcp

An application-neutral MCP client for a running Desktop Driver and supervised desktop workloads. The adapter does not
start or own the application. Agents working in this package start at [AGENTS.md](AGENTS.md).

Run `desktop-mcp` for verified supervisor discovery, or `desktop-mcp --driver-only` for an existing
`agent-connection.json` descriptor. The deprecated `desktop-driver-mcp` executable remains driver-only.
The supervisor mode offers the existing driver tools plus one bounded `desktop_workload` tool; it never falls back to
driver-only mode if supervisor discovery fails.

See [connection and setup](references/connection.md), [tools](references/tools.md), and
[current status](references/current-status.md) for details and qualification.
