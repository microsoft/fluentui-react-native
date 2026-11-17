# Desktop MCP

Application-neutral MCP adapter for a verified Desktop Driver and, in supervisor mode, bounded desktop workloads.
It never starts or owns the host. The server mode and tool list are fixed at startup; management discovery must not
fall back to driver-only discovery.

Read [connection](references/connection.md) for private discovery and lifetime, [tools](references/tools.md) for
schemas and results, and [current status](references/current-status.md) for qualification and discovery budgets.
The [reference index](references/README.md) lists all package guidance. Workload authority belongs to
`@fluentui-react-native/desktop-test/references/management.md`; driver authority belongs to
`@fluentui-react-native/desktop-driver/references/service.md`.

Preserve connection-local principals, verified identity, no replay after ambiguous admission, credential confinement,
and drain-confirmed disposal. Run the package's format, lint, build, and test scripts, followed by repository-wide
validation. Fake hosts do not qualify native endpoints.
