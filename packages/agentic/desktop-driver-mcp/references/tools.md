---
id: desktop-driver-mcp.tools
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver-mcp
---

# Tools

Five tools group the driver's agent operations. Each operation's input schema,
result, and failure reasons are defined once in `@fluentui-react-native/desktop-driver`
(its agent operations reference); the tools reuse those schemas, so a field the
service rejects is rejected here first, before anything reaches the service.
Unknown fields are refused. The whole tool list is about 15.7 KB, and a test
bounds it at 17 KB.

| Tool              | Calls                                              | Hints                       |
| ----------------- | -------------------------------------------------- | --------------------------- |
| `desktop_session` | service status, session creation and deletion      | not read-only               |
| `desktop_observe` | `observe` (default), `find`, `journal`, `artifact` | read-only                   |
| `desktop_act`     | `sequence`                                         | destructive, not idempotent |
| `desktop_check`   | `check`                                            | read-only                   |
| `desktop_capture` | `capture`                                          | read-only                   |

## desktop_session

`action` is `status` (the default), `open`, or `close`.

- `status` lists the targets the grant allows, with their endpoint, platform,
  renderer, and whether a target is quarantined, plus the open session.
- `open` needs a `target`. It attaches to the running application unless
  `launch` is true, and accepts a `clickMode` of `accessibility`, `auto`, or
  `physical`. It returns the session id, the click mode in effect, and which
  operations the target supports, with the reason for any that are unavailable.
  One session is open at a time; opening a second fails with `session-open`.
- `close` deletes the session. Closing the MCP connection does the same.

## desktop_observe

Give at most one of `observe`, `find`, `journal`, or `artifact`, each with that
operation's input; an empty call observes the current window. The `artifact`
form pages through a capture for clients that cannot read resources.

## desktop_act

Takes the `sequence` input: up to eight `act` and `check` steps that run in
order and stop at the first that fails or does not pass, with an optional
closing `observe`. Steps that ran stay done. Name a `requestId` (1 to 64
letters, digits, or `. _ : -`) to make a retry safe: repeating it returns the
first outcome instead of acting again.

## desktop_check

Takes the `check` input. A `waitMs` waits for the predicates to hold.

## desktop_capture

Takes the `capture` input. Every capture returns a `resource_link` to
`desktop-driver://sessions/{session}/artifacts/{artifact}`. With `image: true`,
a capture under 1 MiB also returns an MCP image block; a larger one reports
`imageOmitted: "too-large"` and is read through the link.

Reading the link returns the whole PNG as one blob. The adapter pages it from
the service and checks the bytes against the recorded SHA-256. A link from a
session that is no longer open is refused, because artifact ids restart in
every session.

## Results

A successful call returns the operation's JSON envelope as one text block:
`schemaVersion`, `requestId`, `operation`, the `session` incarnation, and the
`result`. An observation outline is moved into its own text block, so its
lines stay readable, and the envelope's `outline` field names that block, as in
`"(text block 2)"`. Results carry no `structuredContent`, so nothing is sent
twice.

## Errors

A tool failure is an `isError` result with one JSON text block:

| Field       | Meaning                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| `error`     | The WebDriver error code, or `adapter` for a failure the adapter itself reports.                          |
| `reason`    | The machine reason to branch on.                                                                          |
| `message`   | A bounded message.                                                                                        |
| `requestId` | The request id, when the service assigned or echoed one.                                                  |
| `mutation`  | For an action, whether it was applied, rejected, or indeterminate, and whether it quarantined the target. |

The adapter's own reasons are `no-session`, `session-open`,
`service-unavailable`, `cancelled`, and `internal`. A malformed call is
refused with the schema's validation message.

A failed resource read is a JSON-RPC error: `-32602` with a `data.reason` of
`artifact-expired` or `artifact-changed`, or the service's reason for an
invalid argument; `-32603` otherwise.

## Progress and cancellation

When a call carries a progress token, the adapter reports progress about once
a second until the call ends, so a client that resets its timeout on progress
can wait out a long check. The ticks never reach the service, so a waiting
model does not keep an idle session alive.

Cancelling a call aborts its HTTP request. The service treats that as the
caller leaving: work not yet dispatched is cancelled and journaled with the
reason `cancelled`, and the session stays usable.
