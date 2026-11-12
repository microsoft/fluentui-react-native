# @fluentui-react-native/desktop-driver-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server that gives
coding agents the Desktop Driver agent operations: bounded observation,
element search, actions, checks with waits, captures, and Storybook story
selection on a native macOS or Windows application.

**Work in progress:** [current status](references/current-status.md) records
implemented connection safeguards, orchestration gaps, native qualification
requirements, and measured MCP discovery costs.

Agents working in this package start at [AGENTS.md](AGENTS.md).

## How it connects

The adapter does not start anything. A trusted supervisor runs the Desktop
Driver service with an authority, issues the agent a grant, and publishes a
private connection descriptor. The adapter reads that descriptor, has the
installed native helper verify the listening service's process identity, and
only then sends the grant to obtain its own driver-only child principal. Two
connections reading the same descriptor cannot share sessions. Disposal revokes
and drains the child, including ambiguous acquisitions; old services without
delegation fail closed. See
[Connection and setup](references/connection.md).

`desktop_session` with `action: "relinquish"` cancels and drain-confirms the
controller before an operator's generic attach-only WDIO runner takes over.
After runner cleanup, open a fresh session; no old resources are resumed.
See [session actions](references/tools.md#desktop_session).

## Use it

Register the server with an MCP client that launches it over stdio:

```json
{
  "mcpServers": {
    "desktop-driver": {
      "command": "npx",
      "args": ["desktop-driver-mcp", "--descriptor", "agent-connection.json"]
    }
  }
}
```

The agent then calls `desktop_session` to list targets and open one,
`desktop_observe` to read or page an immutable observation, compare it with a
retained sample, search, or inspect the journal, `desktop_act` to change it,
`desktop_check` to verify state, and `desktop_capture` for pixels. On a
Storybook target, `desktop_story` lists the stories and renders one. See
[Tools](references/tools.md).

## References

The [reference index](references/README.md) lists every package reference.
