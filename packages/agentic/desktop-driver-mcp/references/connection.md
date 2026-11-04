---
id: desktop-driver-mcp.connection
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-driver-mcp
---

# Connection and setup

The adapter is a client of a Desktop Driver service that is already running. It
never launches the service, builds a native helper, or accepts a URL or grant
from its command line, its environment, or the model.

## What the supervisor does

A trusted supervisor, the program that owns the application under test, does
four things before an agent connects:

1. Starts the service with a `DesktopAuthority` and the targets the agent may
   use.
2. Issues the agent a grant that names those targets.
3. Describes its own process with the native helper, and publishes a private
   connection descriptor holding the service URL, the grant, and that identity.
4. Removes the descriptor after the service drains.

The descriptor format, storage, and verifier contracts belong to
`@fluentui-react-native/desktop-driver`
(its service reference, "Private connection descriptors").

`desktop-test` is the shipped supervisor. For a target registered in a
`desktop.config` file, `desktop-test --target <name> serve --agent` does all
four steps and publishes `agent-connection.json` at the platform default;
`--descriptor` and `--root` change where. A target with `ownership: "external"`
accepts only attach sessions. See `@fluentui-react-native/desktop-test` (its
commands reference).

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
desktop-driver-mcp [--descriptor <name>] [--root <path>]
```

| Option                | Meaning                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `--descriptor <name>` | The record name the supervisor published under. Defaults to `agent-connection.json`.                                                  |
| `--root <path>`       | The private storage root, when the supervisor published somewhere other than the platform default. It must be absolute and canonical. |

The adapter speaks MCP over stdio until the client closes stdin, then deletes
the session it opened. `--help` and `--version` write to stderr so stdout
carries only protocol.

The adapter resolves the native helper with source builds disabled. The helper
must already be cached by `desktop-driver resolve-driver` or `build-driver`, or
named by `FURN_DESKTOP_DRIVER_HELPER_PATH` or
`FURN_DESKTOP_DRIVER_INSTALL_ROOT`. The helper verifies that the process
listening at the descriptor's URL is the one the supervisor described, on the
same user and interactive session, before the grant leaves the adapter. The
service then confirms its incarnation.

## Connecting lazily and reconnecting

The adapter connects on the first tool call, not at startup, so it can start
before the service. When the service cannot be reached, a tool returns the
fixed reason `service-unavailable`; the cause, which may name local paths, goes
to stderr. When a connected service stops answering, the adapter forgets the
client and the session, and the next call reads the descriptor again. A
restarted service has a new incarnation and new grants, so the agent opens a
new session and observes again.

## Embedding

`createDesktopDriverMcpServer({ connect, version })` returns an SDK `McpServer`
for any transport. `connect` returns a `DesktopDriverClient`; production callers
pass `connectWithDescriptor({ descriptor, root })`. Closing the server deletes
the session it opened.
