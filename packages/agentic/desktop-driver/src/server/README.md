# Desktop host server

`server/` owns every listener, child server process, runner process, IPC message, deadline, and
host shutdown sequence.

## Topology

```text
React Native Storybook app
          │ Storybook channel events
          ▼
server/host.ts
  ├─ channel/bridge.ts ── RunCoordinator
  ├─ runner/wdio-runner.ts ── one WDIO process/session
  └─ webdriver/client.ts ── isolated native WebDriver child
```

Metro remains separate. There is no tokenized secondary run server.

## Composition

- `host.ts` owns Storybook's maintained channel/MCP server and shutdown ordering.
- `coordinator.ts` validates manifest-constrained requests, enforces one active run, publishes
  progress, and owns cancellation.
- `index.ts` exposes only `startDesktopHost()` and the minimal host handle.

Shutdown order is:

1. stop accepting requests;
2. announce host closing;
3. abort and await the active runner;
4. close owned native/runner resources;
5. close the Storybook channel server;
6. preserve cleanup failures with the primary failure; and
7. resolve the host's `closed` promise.

All shutdown operations are idempotent. The app under test is never a host-owned resource in attach
mode.

See the submodule READMEs for channel, runner, and native WebDriver details.
