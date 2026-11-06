# Desktop Driver MCP agent instructions

This package is the Model Context Protocol adapter for the Desktop Driver agent
operations. It is the instruction root for this package and every descendant.

## Start here

Read the [README](README.md), then the narrowest entry in the
[reference index](references/README.md). The operations themselves, their
schemas, and their failure reasons belong to `@fluentui-react-native/desktop-driver`
(its agent operations reference); this package
only maps them onto MCP.

## Invariants

- Stay a thin client. Every tool calls the service's operation routes through
  the typed client; never add a second execution path, a host, or state the
  service does not own. Tool input schemas come from the driver's registered
  operation schemas, so the service and the adapter cannot drift apart.
- stdout carries MCP protocol only. Diagnostics go to stderr. Never log the
  grant, the descriptor contents, or application text.
- Connect only through a private connection descriptor, verified by the
  installed native helper before the grant is sent. Never launch or build the
  service or a helper, and never accept a URL or grant from a command line,
  environment variable, or the model.
- Serialize acquisition, use, close, and disposal per MCP connection. Retain
  cleanup responsibility after transport loss; reverify discovery and never
  replay a failed mutation. A verified replacement invalidates old references.
  Fence a lost acquisition response; disposal also cleans up late acquisitions.
- Delegate a distinct driver-only child after verified discovery. Retain it on
  same-incarnation/descriptor-principal rediscovery; never share or resume another
  connection's session. Disposal awaits child revocation, keeping terminal-only
  cleanup proof for lost responses and failed drains; unauthorized is not cleanup.
- Tie every artifact link to its session. Artifact ids restart in each session.
- Progress ticks come from the adapter and never reach the service, so a waiting
  model does not keep an idle session alive. Cancellation aborts the HTTP call,
  which the service treats as the caller leaving.
- Messages the model reads are fixed or bounded. Connection failures use fixed
  diagnostics on stderr too; never echo discovery exceptions or descriptor contents.

## Validation

Run `yarn format`, `yarn lint`, `yarn build`, and `yarn test` in this package.
Changes to tool schemas also need the tool-list size bound in `src/server.test.ts`
to hold. A change to driver operations is validated in the driver package first.
JavaScript tests use the fake host and are not native qualification; record a
live run against a real application for native claims. Add a patch changeset
for this published package when its behavior or shipped guidance changes.
