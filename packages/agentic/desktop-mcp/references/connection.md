---
id: desktop-mcp.connection
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-mcp
---

# Connection and setup

The adapter is a client of a Desktop Driver service that is already running. It
never launches the service, builds a native helper, or accepts a URL or grant
from its command line, its environment, or the model.

## Startup modes

The default supervisor mode reads `supervisor-connection.json`. It verifies
the management listener's native identity and authenticated incarnation,
then verifies the bound driver descriptor, digest, incarnation, and sole
target. The management connector obtains a distinct principal for each MCP
connection, and the driver controller separately delegates its own child.
The model never receives either credential.

`desktop-test serve --agent` and `storybook driver --agent` publish the
supervisor descriptor after the driver is ready. Storybook also publishes its
runner descriptor before readiness. Workloads must be explicitly opted into
the trusted catalog; legacy Storybook configuration without declared suites
has an empty catalog. See
`@fluentui-react-native/desktop-test/references/management.md`.

Use `--driver-only` to read the original `agent-connection.json` without
management authority. The deprecated `desktop-driver-mcp` executable always
uses this mode. The choice is fixed at startup; a failed supervisor
verification never falls back to driver-only discovery.

## What a driver-only supervisor does

A trusted supervisor, the program that owns the application under test, does
four things before an agent connects:

1. Starts the service with a `DesktopAuthority` and the targets the agent may
   use.
2. Issues the agent a grant that names those targets.
3. Describes its own process with the native helper, and publishes a private
   connection descriptor holding the service URL, the grant, and that identity.
4. Removes the descriptor after the service drains.

The descriptor grant defaults to `driver-control`. After verification, each MCP
controller uses `delegateConnection()` to obtain a distinct driver-only child
client. The child credential never enters tool results or diagnostics. Older or
unprotected services without the delegation route are explicitly unsupported by
this adapter, not a fallback to shared session authority. The generic driver's
unprotected mode is unchanged.

The descriptor format, storage, and verifier contracts belong to
`@fluentui-react-native/desktop-driver`
(its service reference, "Private connection descriptors").

`desktop-test` is the shipped supervisor. For a target registered in a
`desktop.config` file, `desktop-test --target <name> serve --agent` does all
four steps and publishes `agent-connection.json` at the platform default;
`--descriptor` and `--root` change where. A target with `ownership: "external"`
accepts only attach sessions. See `@fluentui-react-native/desktop-test` (its
commands reference). For a Storybook app, `storybook-desktop driver --agent`
(or `desktop-test serve --agent` on a Storybook target) publishes the same
descriptor from the channel service that embeds the driver, so `desktop_story`
can list and render its stories. See `@fluentui-react-native/storybook-desktop`
(its commands reference).

A program that embeds the service instead does the same steps itself. A macOS
supervisor looks like this:

```ts
import { createDesktopDriverServer, NativeDesktopHost, resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver';
import {
  createMacOSPrivateStorage,
  DesktopAuthority,
  describeMacOSService,
  publishConnectionDescriptor,
} from '@fluentui-react-native/desktop-driver/authority';

const artifact = await resolveNativeDesktopDriver({ platform: 'macos' });
const authority = new DesktopAuthority();
const grant = authority.issue({ label: 'agent', targets: ['calc'] });
const host = new NativeDesktopHost({
  application: { bundleIdentifier: 'com.apple.calculator', windowTitle: 'Calculator' },
  artifact,
  endpoint: 'macos',
});
const service = await createDesktopDriverServer({
  authority,
  targets: [{ endpoint: 'macos', host, id: 'calc', platformName: 'macos' }],
});
const identity = await describeMacOSService({ artifact, pid: process.pid });
const removeDescriptor = await publishConnectionDescriptor(await createMacOSPrivateStorage(), 'agent-connection.json', {
  grant: grant.token,
  service: { ...identity, incarnation: authority.incarnation },
  url: service.url,
  version: 1,
});
```

On Windows, use `createWindowsPrivateStorage({ artifact })` and
`describeWindowsService({ artifact, pid })` instead.

## Running the adapter

```sh
desktop-mcp [--driver-only] [--descriptor <name>] [--root <path>]
```

| Option                | Meaning                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `--driver-only`       | Use the driver descriptor and omit the workload tool.                                                                                 |
| `--descriptor <name>` | Private record name. Defaults to `supervisor-connection.json`, or `agent-connection.json` in driver-only mode.                        |
| `--root <path>`       | The private storage root, when the supervisor published somewhere other than the platform default. It must be absolute and canonical. |

The adapter speaks MCP over stdio. Stdin EOF, `SIGINT`, `SIGTERM`, or `SIGHUP`
(where supported) stops admissions and starts one cleanup. The adapter
attempts to revoke and drain its driver child, including late
or ambiguous acquisitions. Driver cleanup waits at most ten seconds; an
unresolved attempt continues while the process lives and reports to stderr.
In supervisor mode, connection disposal also cancels and waits for that
principal's workload cleanup. Failed, pending, or unreachable cleanup is
reported on stderr and exits nonzero. The supervisor must drain or fence an
unsettled host. A forced kill cannot run this cleanup.
`--help` and `--version` write to stderr so stdout carries only protocol.

The adapter imports helper resolution from the driver's `/native` entry and
uses the driver's `/authority`, `/client`, and `/operations` entries rather
than loading its root and WebdriverIO integration. It resolves the native
helper with source builds disabled. The helper must already be cached by
`desktop-driver resolve-driver` or `build-driver`, or named by
`FURN_DESKTOP_DRIVER_HELPER_PATH` or `FURN_DESKTOP_DRIVER_INSTALL_ROOT`. The
helper verifies that the process listening at the descriptor's URL is the one
the supervisor described, on the same user and interactive session, before the
grant leaves the adapter. The service then confirms its incarnation.

## Connecting lazily and reconnecting

The adapter connects on the first tool call, not at startup, so it can start
before the service. When the service cannot be reached, a tool returns the
fixed reason `service-unavailable`; stderr reports a fixed diagnostic without
echoing discovery errors, which may contain paths or credentials. If the
supervisor refuses a new principal because it is full, the reason is `capacity`.

In supervisor mode the connection retains its private principal and
connection ID across retries. Concurrent opens share one acquisition. If
connection-creation responses are lost, retries use that same ID; disposal
can revoke the uncertain acquisition and prevents a late open from
recreating it. After `serve` restarts, restart the MCP adapter. On a
failed call, if the private descriptor names a different supervisor
incarnation, the adapter reports `supervisor-restarted` instead of rebinding.
While the descriptor is gone or unreadable, it can only report
`service-unavailable`. Restarting the adapter does not recover old handles,
sessions, or unresolved runs, and it does not replay an operation.
A lost run admission is reconciled in the original connection
with `desktop_workload` status by request ID; the adapter will not submit that
ID again.

For driver-only connections:
Transport failure invalidates the cached connection, **not** known
session cleanup responsibility. The next call re-verifies discovery. The same
verified service incarnation and descriptor principal reuse the controller's
existing private child client, never another connection's child. This retains
known-session cleanup responsibility rather than resuming across connections.
A replacement service or an authoritative invalid/revoked
session invalidates old references; open a new session and observe again.
Authoritative child rejection also discards its cached binding. Once an
operator-preempting runner has drained, the same MCP connection can delegate a
fresh child from the still-live descriptor; it cannot reuse the revoked child
or any old references, cursors, proofs, or artifact links.
Nothing automatically replays the failed operation.

Operations, acquisition, close, and complete resource reads are serialized per
MCP connection. Disposal stops admission immediately and drains the child,
including sessions whose acquisition completes late. A failed session DELETE
retains responsibility until confirmed deletion or authoritative invalidation.
A lost create response has
no safely known session id: `session-uncertain` fences further acquisition and
mutation. Close the MCP connection to revoke and drain its child, or have the
supervisor revoke and drain the parent. Do not guess an id or acquire again
under the same child.

A new principal on the same live service does not prove that the old session
ended. The adapter first awaits terminal cleanup with the old child before
delegating from a replacement descriptor principal. Grant labels are not
principals. A revoked child credential is retained solely to retry its own
`DELETE /furn/grants/current` cleanup after a lost response or failed drain;
unauthorized is never treated as successful cleanup. Repeated disposal can
retry an incomplete cleanup while the process remains alive.
There is no resume across different MCP connections and no crash-safe native
recovery promise; see [current status](current-status.md).

The authority limits delegation to eight edges and 4096 live or not-yet-drained
grants. Successful subtree drains restore capacity without restarting.
Pending and failed cleanup proof is never evicted; terminal retry proof for
the last 4096 fully drained records remains available. Older settled records
expire and their credentials fail closed, without recovering driver authority.

## Embedding

`createDesktopMcpServer({ mode, ... })` returns an SDK `McpServer` for any
transport. Supervisor mode takes a connection-local `connector` from
`connectSupervisorWithDescriptor`; driver-only mode takes `connect`.
`createDesktopDriverMcpServer({ connect, version })` remains the driver-only
compatibility API. `connect` returns `DesktopDriverConnection`:
`{ client: DesktopDriverClient, incarnation: string, principal: string }`.
The incarnation is the verified service identity, not its URL/port; the principal
is the non-secret grant ID, never its label or bearer token. This is a
work-in-progress embedding API. Production callers pass
`connectWithDescriptor({ descriptor, root })`, which supplies these values after
verification. Closing the server begins bounded cleanup as described above.
