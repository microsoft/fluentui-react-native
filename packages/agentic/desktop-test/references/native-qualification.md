---
id: desktop-test.native-qualification
kind: instruction-reference
owner_paths:
  - packages/agentic/desktop-test
  - packages/agentic/desktop-driver
  - packages/agentic/desktop-driver-mcp
  - packages/agentic/storybook-desktop
---

# Native descriptor-path qualification

Use this runbook to qualify the desktop foundation against the combined
integration commit, not an individual track branch. The current macOS procedure
is parameterized by renderer; Windows Fabric and Win32 Paper require their own
machines and must remain **Not run** on macOS. Deterministic fake-host results
and Storybook callback smoke results are supporting evidence, not proof of the
real descriptor path.

## Parameters and prerequisites

Record these for every renderer run:

| Parameter   | Value                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| `COMMIT`    | Exact `git rev-parse HEAD`; final acceptance uses the coordinator's combined F2/F3/F4/F5 SHA.                             |
| `APP`       | Agentic Components Storybook / `ReactTestApp`; record the exact bundle identifier from the run.                           |
| `OS`        | `sw_vers -productVersion` and `uname -m`.                                                                                 |
| `ENDPOINT`  | `macos`; the renderer is `fabric` or `paper`.                                                                             |
| `SELECTION` | Exact story/test selector and actual selected count from `run.json`; do not infer selection from an environment variable. |
| `ARTIFACT`  | Workspace-relative `apps/storybook/artifacts/desktop/<run-id>/run.json`; retain only approved, redacted summaries.        |

1. Obtain the exclusive `native-desktop-validation` lock. Run one interactive
   desktop workload at a time; do not overlap physical-input runs.
2. Explicitly build the native helper and run its noninteractive preflight:

   ```sh
   yarn storybook build-driver --macos
   yarn desktop-driver doctor --platform macos --permissions
   ```

   Record the exact helper artifact, signing mode, designated requirement, and
   Accessibility, PostEvent, and ScreenCapture preflight values. Do not use
   `--prompt`, change OS permissions, or treat a semantic `activate` as proof
   of physical input. If a capability is unavailable, mark its case skipped
   or not run.

3. Check static discovery without launching the native app:

   ```sh
   yarn storybook manifest --macos
   yarn storybook test --macos --list
   ```

   Use the generated manifest's exact story IDs and test names; do not guess
   slugging or test names.

## Per-renderer app pass

Run Fabric and Paper as separate passes. Bundle before `prep` so CocoaPods
embeds the current JavaScript resources; switching renderers always requires a
new `prep`.

```sh
# Fabric
yarn storybook bundle --macos
yarn storybook prep --macos
yarn storybook smoke --macos --mode stories-and-tests

# Paper; complete the Fabric run and cleanup before switching
yarn storybook bundle --macos --paper
yarn storybook prep --macos --paper
yarn storybook smoke --macos --paper --mode stories-and-tests
```

`smoke` traverses the declared stories and, in `stories-and-tests` mode, runs
the selected static and authored callbacks. It does not expose a `--test`
filter. `STORYBOOK_SMOKE_STORY` and `STORYBOOK_SMOKE_TAG` can request focused
coverage, but always read the terminal `run.json` counts and work selection:
the provisional run recorded below supplied a story environment selector yet
still selected 211 callbacks. For a strict callback subset, keep the app and a
non-agent driver running and use the supported filtered command:

```sh
yarn storybook test --macos --story '<story-id-glob>' --test '<test-name-glob>'
```

Do not use `storybook test` against an agent-served instance; it has no grant.
For every run record selected, executed, passed, failed, skipped, unsupported,
incomplete, retries, flaky count, and the cleanup result. Empty work is not a
pass.

## Real descriptor-path pass

Perform this after the app pass, independently for Fabric and Paper. Use one
supervisor path at a time; do not start `storybook driver --agent` and
`desktop-test serve --agent` concurrently.

1. Start the already-prepared app using the documented app workflow. Start
   either `yarn storybook driver --macos --agent` or the Storybook target via
   `yarn desktop-test --target macos serve --agent`. Wait for the structured
   ready record, including the private descriptor name. Do not print, copy to
   artifacts, or expose the descriptor grant.
2. Connect `desktop-driver-mcp` using its default
   `agent-connection.json` descriptor. Confirm the adapter verified the native
   service identity before any grant is used. Use a real MCP client and the
   public tools; do not substitute a direct unprotected driver URL.
3. Run the following cases against the real descriptor and native service.
   Fault-injection cases must intercept the adapter-to-service transport while
   retaining the real descriptor, verified service, and native helper. Record
   the injected dispatch point and whether a mutation was applied; never retry
   an ambiguous mutation.

| Case                           | Stimulus                                                                                        | Required evidence                                                                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Same-port replacement          | Replace the protected service on the same port after opening a session.                         | Old incarnation/session and references are rejected; the next call re-verifies discovery; no old mutation is replayed.                  |
| Grant revocation               | Revoke the active parent or delegated grant during a connection.                                | Protected access fails closed, authority is rediscovered, and there is no fallback to an unprotected service.                           |
| Dispose during open            | Hold acquisition after dispatch, begin MCP disposal, then release acquisition.                  | Late session is deleted; no new open is admitted; drain completes or remains explicitly uncertain.                                      |
| Failed delete                  | Inject transport loss before and after DELETE dispatch.                                         | Session cleanup responsibility remains; replacement opens are blocked until deletion is confirmed or authoritative invalidation occurs. |
| Ambiguous create               | Drop the session-create response after the service may have created the session.                | The connection becomes `session-uncertain`; no repeated create or guessed session ID; disposal revokes and drains the child grant.      |
| Resource invalidation          | Replace the service or preview context after reading a resource.                                | Old resource identifiers cannot be used; fresh discovery and observation are required.                                                  |
| Story quarantine and recovery  | Cause an unknown-effect story transition, then perform the trusted recovery path.               | Later story mutations are quarantined until authoritative recovery and a verified current marker.                                       |
| Protected args refusal         | Attempt story args through the protected service.                                               | `story-args-unsupported`, no native effect, and no argument values in output, diagnostics, or logs.                                     |
| Failed-cleanup claim retention | Force owned-resource cleanup failure in `desktop-test serve --agent`, then attempt replacement. | `interactive.lock` and workload ownership remain; replacement is refused until exact-owner cleanup is proved.                           |
| Launch-mode discovery          | Connect to launch-capable and attach-only targets.                                              | Advertised modes match target policy; attach-only targets never launch or terminate the external app.                                   |
| Live cleanup and restart       | Fail cleanup, restart the service, and reconnect through its descriptor.                        | Exact cleanup state and new service incarnation are reported; restart alone is not recovery proof.                                      |
| Attached-app preservation      | Start the app externally, connect without launch ownership, then stop the agent service.        | The same app process incarnation and bundle remain running after service/session cleanup.                                               |
| F4 post-dispatch cancellation  | Cancel only after native dispatch is observed.                                                  | Result is applied, rejected, or indeterminate from settlement evidence; timeout is not treated as no effect.                            |
| F4 readiness/render faults     | Delay readiness and inject correlated error/render faults.                                      | No stale readiness is accepted; old preview resources are invalidated.                                                                  |
| F4 lost-context recovery       | Lose the bridge context, then render a fresh preview.                                           | Recovery uses a new authenticated epoch and correlated marker; old context is not resumed.                                              |
| F4 secondary windows           | Exercise a secondary window through its registered identity.                                    | Window identity and cleanup remain exact; no first-match behavior.                                                                      |
| F4 physical input              | Perform the native pointer/keyboard case only with fresh helper permissions.                    | Record actual physical result separately from semantic activation; otherwise mark skipped/not run.                                      |
| F3 startup/shutdown/survivors  | Fail service startup and shutdown with Metro/channel/helper resources alive.                    | Readiness is typed; survivors are reconciled by exact resource identity; failed cleanup retains the workload claim.                     |
| F5 ingress bypass              | Try anonymous and foreign-authority HTTP/WS select, prepare, and args mutations.                | Native preview and marker are unchanged; protected args neither mutate nor leak values.                                                 |
| F5 owned selection/reset       | Use authorized driver selection and reset through the authenticated epoch client.               | Correlated readiness and markers settle; stale preview resources are invalidated.                                                       |
| F5 channel lifetime            | Leave agent mode idle beyond upstream's 20-second timeout.                                      | Owned 10-second JSON heartbeat keeps the channel connected.                                                                             |
| F5 manifest smoke              | Run manifest-backed smoke against the agent path.                                               | One driver session is used; there is no fallback to HTTP mutation routes.                                                               |
| F5 legacy separation           | Exercise the non-agent legacy channel separately.                                               | Results are labeled unprotected/legacy and are not counted as protected-ingress evidence.                                               |

The F3/F4/F5 cases are integration gates, not claims about the F15 baseline.
Run them only on the combined source that contains those tracks. Until then,
record them as **Not run**.

## Cleanup and endpoint limits

After each bounded pass, stop only resources owned by that run and record:

- owned app, driver, channel, and Metro process IDs are gone;
- reported service ports have no listeners;
- the exact per-user `interactive.lock` is absent, or retained with its
  verified owner and unresolved cleanup reason;
- the private descriptor was removed and its grant revoked;
- no externally owned app was stopped.

If cleanup is uncertain, do not remove the lock or start another workload.
Report a blocked question to the coordinator. Release the native lock only
after cleanup evidence is recorded.

On a macOS-only machine, record **Windows Fabric** and **Win32 Paper** as
**Not run**, with no measurements inferred from macOS. Hosted physical-input
or capture skips are skips, not passes. Keep descriptor-path results separate
from smoke/WDIO and deterministic fake-host results in all three package
status ledgers.
