# @fluentui-react-native/desktop-driver

## 0.5.3

### Patch Changes

- 1b42a88: Add bounded, service-local story selection timings and per-case execution/lifecycle observations without changing authenticated readiness, preview remounts, or worker/session isolation. Part of #4435.
  
  Use authenticated direct navigation for driver-owned story selection and cache complete extracted test maps by source content and observed helper digests within the owning run. Preserve normal args support, protected args refusal, manifest-digest verification, and the legacy HTTP default for direct library consumers. Report process-history truncation separately from possible per-case loss; preview generations infer remounts rather than independently counting them.
- c57dcd8: Add opt-in neutral macOS supervisor-owned application launch, exact kernel
  incarnation attach and cleanup, and cross-helper application exclusion. Record
  pending and acquired applications as workload claim resources, including
  uncontained launches and uncertain failures.
  
  Workload claim schema 3 uses the driver's OS process identity instead of an
  uptime-derived wall-clock estimate. Legacy or unverified identities remain
  unknown during inspection. `claimDesktopWorkload` now returns a promise and
  must be awaited; the Storybook integration awaits it before starting.
  
  Pre-spawn and rejected LaunchServices acquisitions release their claims.
  Dispatched or surviving acquisitions remain fenced, and non-contention lock
  failures clean up only the exact application that the helper launched.
  
  Read-only macOS application identity inspection shares descriptor verification
  without acquiring a controlling lease or disturbing session window records.
  Storybook bridge-epoch recovery uses it on the embedded helper while real
  launch/attach operations retain cross-service exact-incarnation exclusion.
  
  Discover live macOS application candidates from kernel PIDs rather than the
  main-run-loop-dependent workspace cache, so read-only inspection sees newly
  launched apps and still refuses duplicate identities.
  
  Native ownership contracts additionally qualify failed and interrupted
  acquisition publication, abrupt owner death and known uncontained descendants:
  uncertainty retains the workload claim until exact operator cleanup. This adds
  qualification only, not automatic survivor adoption or descendant containment.
  Abandoned qualification owners now retire nonzero after two minutes, and the
  AppKit fixture requests termination after five minutes; workload fences remain.
- f2a3037: Add attach-only scoped runner grants, drain-confirmed MCP relinquish and standalone WDIO handoff, with parent-owned worker-crash cleanup and private credential transport. Bound live/draining grant authority separately from settled cleanup history, preserve shared descriptor roots during preemption, and allow preempted MCP controllers to reopen with fresh authority. Deliver worker credentials individually and scrub them before user hooks/specs and their children run; Node bootstrap remains trusted. Storybook handoff and retained launched applications remain unsupported.
- 041ac8b: Identify the unsafe ancestor when macOS private storage rejects directory aliases, permissions, or ACLs.
  
  Expose the Windows helper's validated storage root so consumers can create protected namespaces beneath its OS-selected per-user location.
- 9a66d89: Add exact Windows and Win32 application identities, read-only inspection, cross-service application control exclusion, and bounded recovery of acquired Windows application resources from verified crashed owners. Retire reused recorded incarnations without signalling their replacements, and resume interrupted recovery barriers only after verifying their native owners exited. Keep packaged activation explicitly uncontained and uncertain launches fenced. Resolve Storybook bridge identities without acquiring another controlling attachment.
- f2a3037: Make the test-only Win32 fixture provisioner loadable as built Node ESM so hosted Windows native MCP/WDIO consumer qualification can provision its fixture explicitly without a Jest loader.

## 0.5.2

### Patch Changes

- f14e254: Harden the native helper artifact cache and build locks. Only integrity failures quarantine a cached helper, so a handshake timeout or file-descriptor exhaustion no longer wedges consumers that resolve with `buildPolicy: 'never'`, and a publication collision never trashes an artifact that may be in use. Build-lock waiters keep waiting while the builder's heartbeat is fresh, and stale or ownerless locks are reclaimed. Source digests sort by code point instead of locale and the Windows digest covers only the sources the project declares, so cached helpers rebuild once. The Windows helper builds from staged sources instead of in the package. A cache root inside the package, `node_modules`, or a pnpm store is rejected. Helper build and handshake processes report bounded, clipped diagnostics and are killed if they hang. The macOS private store unlinks its temporary file immediately after publishing, sweeps stale temporaries, and decodes records without stripping a byte order mark.
- 1c38e27: Keep WebdriverIO `setValue` options (so `{ mask: true }` hides the value from logs), type with the session's authoritative input mode, and follow `reloadSession()`. Reject quarantine dates that are not real calendar dates or could never apply instead of letting them never expire. Classify a lost connection, `invalid session id`, and a lane's skipped tests correctly in the story runner, and stop `wait` retrying infrastructure errors. Give each test its own nested, hashed evidence directory with a reserved `failure/` folder, reject duplicate artifact names, and confine artifact paths before creating directories. Order shards by code point and filter globs in linear time. Make the fake host match native selectors, report unsupported `checked`, `expanded`, and `selected` states, and enforce input masks. Add contextual client errors, `DesktopDriverClientError`, and optional `signal` support, and bound `wait` timeouts in authored plans.
- 586e4c3: Report desktop-driver CLI usage errors in every reporter mode. Subcommand usage errors now reach stderr (plain) or a single `error` record (json and ndjson) and exit 1 instead of exiting silently. An invalid `DESKTOP_REPORTER` no longer lets `serve` start. NDJSON failures emit the error record as their terminal record, matching JSON. WebDriver errors map to matching CLI error codes, and `doctor` messages are clipped.
- 8b3a2cc: Make the macOS helper count mouse-button events and drags in the effect ledger, so a cancelled or failed physical click reports a partial effect instead of none and cannot be retried into a second activation. End launched applications with a verified quit, wait, kill, and exit proof on close, dispose, and failed or late launches, keeping the lease when the exit cannot be proven. Release input and stop queued work when the client disconnects or a response cannot be written, ignore `SIGPIPE`, and fail the transport on invalid JSON. Fail closed on an unreadable login session or pointer position, take the cross-process input lock for focus and window geometry changes, require a window frame that matches before capturing it, and report unreadable Accessibility state as unsupported or `target-non-response` instead of a definite answer.
- f52682c: Make native helper shutdown and cancellation reliable. `dispose` now settles when a helper ignores cancel or stops answering: it kills the helper after the cancellation deadline, shares one disposal across callers, and runs every failure through one path that recovers input before rejecting each pending request once. Malformed helper output, duplicate binary identifiers, and stdio errors fail the transport instead of throwing, a lingering grandchild can no longer hold failure handling on the stdio pipes, large frames decode in linear time, and helper stderr is bounded and decoded as whole UTF-8 lines. `NativeDesktopHost` gains a validated `cancellationTimeoutMs` option (default 2000 ms on macOS and 10000 ms on Windows), starts no helper after `dispose`, and no longer rethrows a failed startup from `dispose`. On macOS the helper now runs in its own process group so a terminal Ctrl+C no longer races the orderly shutdown.
- 6404535: Fix the agent operations. Observation paging and deltas no longer re-serialize the tree for every candidate, and a delta no longer issues references it does not return or for removed elements. `sequence` refuses a whole request up front for selector content the operator denies and for a `clear` the session's strict input mode cannot perform, which the service now always reports from its mode and the target's features instead of leaving it permissive. `act` names the proven reference and reports an unsupported `enabled` or `visible` state as `state-unsupported`, reports provider failures in fixed words, and reports a click that raised the window before failing as partial instead of rejected. `check` ends on an unsupported fact and spaces its evaluations. Malformed references and unknown fields no longer echo caller text, session capacities outside their ranges are rejected instead of clamped, and `complete` and `truncation` mean the same on `find`, `journal`, and `stories`, which now always reports both. Document the missing failure reasons and `furn:inputMode`, and correct the `/agent` README row, which is not bounded.
- 6404535: Harden the Desktop Driver server fences, capabilities and recovery. The named accessibility action route enforces the Storybook preview-context fence like click, clear and value, and story select and reset find the story root in any session window. Closing a session releases held input even when the settlement journal is down, leaves the application open if the release did not run, and lifts a launched application's quarantine only when a probe reports it exited. The journal adopts a record that storage created before failing, treats an absent record as removed, and bounds every storage and probe call. Unknown or mistyped `furn:` capabilities are rejected, and `furn:launchMode` is returned. Browser rejection also requires a loopback `Host` and no browser Fetch Metadata, the listener must bind a loopback address and keeps a permanent error handler. Startup options are validated strictly. A target registered after startup reads its journal before it is reported or opened. Timeouts are validated together, reject unsafe integers, accept a `null` script timeout, and an implicit wait ends when the session is deleted. Malformed percent-encoding is `invalid argument`, an unknown `/furn/*` route is `unknown command`, and `POST /window/new` is `unsupported operation`.
- 6b644ce: Fix native Divider separator semantics, button and popup-trigger accessibility activation, Win32 keyboard press lifecycle and grouped Tab navigation, and standalone ListboxItem accessible names exposed by expanded agentic component tests. macOS Fabric press activation requires the repository's React Native macOS patch.
- 3b2787e: Check cancellation in more Windows helper waits: bounded UI Automation calls, the whole-subtree cache, window response probes, posted window restores and moves, activation retries, and the `closeApplication` termination wait, and a cancelled mutation reports effect `unknown`. Direct UI Automation calls and the activation calls themselves can still block. Window management and activation probe the target window first and fail with reason `target-non-response` when it does not answer. A restore that stalls after its initial probe reports effect `unknown` rather than `partial`. Held keys and buttons keep the physical input lock while the helper runs; failed cleanup retains unreleased input for retry, and a failed physical mutation reports an unknown effect. The adapter retains uncertain input for recovery, and disposal reports failed cleanup. Queued commands are dropped after the transport ends. A malformed or non-object JSON frame now fails the transport. Pointer presses and scrolls over another application's window are refused, failed pattern and focus reads are no longer reported as unsupported or unfocused, a job-contained launch root is no longer terminated after launch, a packaged launch root must report its AUMID, an unreadable start time fails the lease, and activation grants foreground rights only to the target process.

## 0.5.1

### Patch Changes

- 26cc577: Record partial combined-candidate macOS native qualification evidence.
- da2b62c: Describe the Storybook CI input lanes: the hosted Windows and Win32 jobs run the accessible lane, and an advisory Win32 job runs the physical lane.
- 26cc577: Document the provisional macOS native qualification evidence and integrated
  descriptor-path requalification procedure.
- 26cc577: Add local story-provider lifetime/cancellation context, authenticated connection
  epochs, versioned native marker conformance, prompt disconnect failure, and stale
  preview mutation rejection. Fence interrupted navigation conservatively and
  report renderer-specific bridge/relaunch failures without claiming transparent
  upstream reconnect or clearing unknown-effect quarantine.
- 26cc577: Disable alternate HTTP and WebSocket mutation ingress on agent-served Storybook
  channels, dispatch authorized selections only to the authenticated runtime, and
  retain explicit protected args refusal. Route manifest-backed smoke traversal
  through driver sessions and cover foreign-authority selection and args refusal.
- 26cc577: Prevent reobserving a surviving native preview element from reviving a reference issued before Storybook selection or reset.
- 8574d22: Add modality-aware desktop test descriptors: `desktopIt` and `desktopDescribe` declare `requires`, `input`, `platforms`, `scope`, and known gaps for Storybook cases and, through `desktop-test/jasmine`, WebdriverIO Jasmine specs. `--input accessible|physical` (or `DESKTOP_INPUT`) runs one input lane, selects the cases that apply, masks the host for the accessible lane, and reports the lane and what it excluded.
- ac20660: Enforce input policy per WebDriver session and report case-level input mechanism receipts.
- 26cc577: Persist authenticated Storybook epochs beside settlement records in stable private target storage. Verify the exact live application incarnation before returning renderer-specific relaunch-required after a service restart; initial absence, replaced applications, and indeterminate probes remain bridge-unavailable.
- 319d38c: Contain unpackaged Windows launches in a helper-owned Job Object so the application and its descendants end with the lease or the helper, report each lease's `containment` (`job-object`, `uncontained`, or `external`), and fail attach closed on unreadable or cross-session identity. A refused foreground activation now re-attaches to a changed foreground holder and names the holder and its cause.
- 26cc577: Repair Windows package-boundary validation, tolerate bounded atomic-report
  sharing conflicts without hiding persistent failures, and record descriptor-path cleanup,
  correlated render faults, recovery, and separate legacy smoke evidence, retaining
  earlier failures and partial native coverage.
- 26cc577: Record Windows Fabric and Win32 Paper native qualification results in the
  status ledgers and add Windows parameters to the native qualification runbook.

## 0.5.0

### Minor Changes

- bac8b51: Close a protected service's idle grant sessions after `idleSessionTimeoutMs` (ten minutes by default) through the same path as `DELETE`.
- bac8b51: Add the macOS service verifier: `describeMacOSService` and `createMacOSServiceVerifier` on the `/authority` entry, backed by a new one-shot `--service-identity` mode in the macOS helper that checks the process identity, audit session, and exclusive loopback listener before a credential is sent.
- bac8b51: Persist target quarantines across service restarts with an optional settlement journal, add operator `recoverTarget`, and add the macOS `--application-incarnation` helper mode with `createMacOSApplicationProbe`.

### Patch Changes

- bac8b51: Add the `act` agent operation. It clicks with a physical pointer, performs the default accessibility action, types, or clears one element, which must be named by a reference that a `find` proved unique and by that find's sample id. Before dispatching, it rereads the element inside the target's input turn and refuses one whose role, name, or automation id changed, or that is disabled, hidden, or covered. The result reports the mechanism used. A mutating request with a caller-chosen `requestId` is recorded, so repeating it returns the first outcome instead of acting again, and reusing the id for a different request fails with `request-id-reused`. While the target is quarantined, `act` is refused in fixed words and reads continue. The typed client gains `act()`.
- bac8b51: Add the `capture` and `artifact` agent operations: window and element PNGs kept as bounded session artifacts with provenance and a SHA-256, returned inline only on request and readable in pages.
- bac8b51: Add the `check` agent operation. It compares a referenced element's states, name, value, or text with what is expected, or counts the elements a selector matches (`none`, `unique`, or `some`), and reports each expectation's status with the actual value when it failed. With `waitMs`, up to 30 seconds, it re-evaluates on the provider's change events and a bounded poll until the expectation holds, and otherwise reports `timed-out` with the last status. An incomplete search is `inconclusive`, never an absence, and expected values and text are refused when the operator denies content. `act` also accepts a selector in `find`, which a search inside the request must prove unique, and returns the proven `ref` and `sample`. The typed client gains `check()`.
- bac8b51: Let typed-client operation calls take an `AbortSignal`, which the service treats as the caller leaving, and export `maxRequestIdLength` from `/operations`.
- bac8b51: Add versioned agent operations to the driver service. `GET /session/{id}/furn/ops` lists a catalog of operations with JSON Schemas, and `POST /session/{id}/furn/ops/{name}` runs `observe`, `find`, or `journal` on the session's command queue. `observe` returns a bounded outline or node list of a window or element subtree under explicit budgets and names why it stopped. `find` reports whether a match is unique, none, multiple, or inconclusive and never proves uniqueness or absence from an incomplete search. Both issue session-scoped element references and release the provider records they do not return. Each session keeps a bounded journal that never holds typed text or displayed content, and operators can deny reading displayed content with `createDesktopDriverServer({ operations: { content: 'deny' } })`. The typed client gains `operations()`, `operation()`, `observe()`, `find()`, and `journal()`, and `./operations` exports the catalog and executor. Operations need a helper that negotiates `boundedObservation`, which today is the macOS helper and the fake host.
- bac8b51: Add the `sequence` agent operation. It runs up to eight `act` and `check` steps in order in one call, stopping at the first act that fails or check that does not pass, and optionally closes with a bounded observation. Each step reports its own result or a sanitized error with the act's mutation report; steps that ran stay done. The request is refused before the first step when it could not run as a whole: a quarantined target, an unsupported action, or content the operator denies. The checks share one 30-second wait ceiling. The catalog names embedded step schemas by operation instead of repeating them. The typed client gains `sequence()`.
- bac8b51: Add the bounded observation contract to the native protocol: `observe` reads one budgeted, breadth-first sample of a window's accessibility tree and `releaseElements` drops the records Node created for agents, both negotiated as the additive `boundedObservation` helper feature. The native host validates every request and response against the contract, and the fake host is the reference provider. Helpers that do not negotiate the feature behave as before.
- bac8b51: Add the `perform` action to `act`, which runs an accessibility action an element publishes by name. The macOS helper binds each listed action to an opaque per-process key so the action performed is exactly the one listed.
- bac8b51: Add the `stories` and `story` agent operations, which list a Storybook target's story catalog and render a story with marker verification, preview-region expiry, and settled failure reports. Uncertain changes quarantine the target.
- bac8b51: Report `tree-too-large` from the Windows helper's `tree` and `find` when an oversized tree outlasts the whole-subtree UI Automation transaction, by counting the subtree one child at a time up to the node limit instead of failing with `automation-failed`.
- bac8b51: Serialize MCP connection and session lifetimes, reverify authority after transport failures, and fence ambiguous acquisitions. Discover target launch modes, quarantine uncertain story changes, refuse ungoverned args updates on protected services, and retain workload claims after uncertain cleanup. Document the work-in-progress layering and package-owned capability, qualification, and measurement status.
- bac8b51: Long-lived `serve`, `driver`, and `server` commands now write their bounded summary when they fail before readiness, instead of exiting with empty structured output. Integrations receive an `onReady` callback for `serve`. Storybook CLI tests no longer overwrite a live app's generated driver state. Records the live macOS paging and delta qualification.
- d50b1ea: Separate driver, declared-workload, and recovery grant scopes. Add bounded,
  attenuated connection principals and awaitable descendant revocation with
  retryable terminal-only cleanup proof. Isolate MCP sessions per connection and
  keep descriptor credentials out of diagnostics.
- 0cfecf0: Add a dedicated native helper entry to desktop-driver and enforce the neutral desktop package dependency boundary with standalone consumer contracts.
- bac8b51: Fix window activation on macOS for SwiftUI applications, such as Calculator on macOS 27, whose windows refuse `AXRaise` with `attributeUnsupported`. Activation now records that refusal and lets its frontmost and main-window checks decide, so physical clicks and typing no longer fail before they start.
- bac8b51: Implement bounded observation in the macOS helper. `observe` samples a window's accessibility tree breadth first with one multi-attribute read per element under visited, depth, string, byte, and deadline budgets, and `releaseElements` drops element records. Element ids are shared with `tree`, `find`, and `snapshot`. The `actions` fact and `accessibilityActions` now return an empty list for an element whose action query reports a general failure, as AppKit split dividers do, instead of failing the command.
- bac8b51: Stop the macOS helper from publishing a `window-closed` event for a window that `closeWindow` closed. The native protocol reserves the event for windows the platform destroys, but the observer thread published it whenever the destroyed notification arrived before the command forgot the window, which happened on every close of a Calculator window. The helper now marks the window before it presses the close button, still records the destruction in the window event log, and removes the mark if the press fails. The fake host no longer publishes the event for `closeWindow` either.
- bac8b51: Stop the macOS helper from growing its memory with every request. Its stdin reader and worker threads run no run loop, so nothing drained their autorelease pools, and a long session added about 25 KB per command plus 80 KB per `tree` and 250 KB per full `observe` for good. Each frame and each request now runs in its own autorelease pool, and the helper holds steady across thousands of requests.
- bac8b51: The macOS helper no longer attaches an `effect` when a queued read or lifecycle command is cancelled before it starts, matching the native protocol and the Windows helper. A queued mutation and an unknown id still report `none`. A new self-test drives the stdio host over in-process pipes and checks that cancelled queued requests never run.
- bac8b51: Report macOS window-event history truncation after the bounded event ring evicts older notifications, matching the Windows provider.
- bac8b51: Add versioned private connection descriptors, a macOS owner-validated storage
  adapter, and grant support for connected, attached, and WDIO-managed clients.
  Descriptors require a trusted live service identity verifier before sending a
  credential, then verify the authenticated service incarnation. Storage rejects
  unsafe permissions, ACLs, links, oversized records, and replacement of existing
  records; the macOS adapter explicitly rejects unsupported platforms, including
  Windows, which has its own adapter. Protected client transports
  reject redirects and keep grants out of serialized WDIO options. Extend the
  gated native-helper contract to exercise the protected service boundary.
- bac8b51: Let the driver service authenticate callers and keep their sessions apart. Pass a `DesktopAuthority` (new `./authority` export) to `createDesktopDriverServer`, issue each caller a grant with `authority.issue({ label, targets })`, and give the typed client its token with `createDesktopDriverClient({ grant })`. A protected service answers every route, including ordinary WebDriver routes, unknown routes, and `/status`, with HTTP 401 `unauthorized` unless the request carries a valid grant, and it decides that before reading the request body. A session belongs to the grant that created it and is invisible to every other grant, a grant opens only the targets it names, and a target that is busy or quarantined reports `data.reason` `target-busy` or `target-quarantined` with the holder's label but no grant, secret, or session identifier. Revoking a grant closes its sessions. A service started without an authority behaves as before.
- bac8b51: Add bounded observation paging and deltas; extend the prior macOS M3 evidence record.
- bac8b51: Add shared CLI reporter modes with bounded JSON summaries and NDJSON progress, propagate reporter settings to delegated commands, and emit Storybook readiness records only after service checks pass.
- bac8b51: Drain grant-owned sessions on revocation, cancelling in-flight work and rejecting queued commands before teardown.
- bac8b51: Settle failed and cancelled mutations before reusing a target. Native helpers report an additive `effect` (`none`, `partial`, or `unknown`) on a failed or cancelled mutating command, the macOS helper tracks it with an effect ledger, and the service quarantines a target whose mutation may have reached the application, refusing later mutations with `target-quarantined` instead of replaying them. A failed mutation reports its `data.mutation` disposition (`applied`, `indeterminate`, or `rejected`), `/status` lists active quarantines, and a late success after a Node timeout is reported as applied.
- cd0ede2: Share native service construction between the generic supervisor and Storybook
  channel child, wiring private durable settlement recovery, exact application-exit
  probes, protected descriptor lifetime and settled shutdown. Keep corrupt sibling
  journal records fenced rather than allowing a valid record to mask uncertainty.
- bac8b51: Treat empty reporter environment variables as unset and stop CLIs crashing when stdout closes, and make the Windows helper fail closed when a UI Automation mutation does not settle by reporting `mutation-indeterminate` and refusing later mutations with `target-quarantined`.
- bac8b51: Report a macOS application that stops answering with a reason. A read that failed because the target did not respond used to reach callers as a bare `unknown error`. The helper now marks it with `data.reason` `target-non-response`, and Node keeps that reason and `nativeCode` `automation-failed` on the error, in the operation response, and in the session journal, so an agent can wait and retry instead of treating the request as wrong.
- bac8b51: Add `createWindowsApplicationProbe` to `./authority` and the Windows helper's `--application-incarnation` mode behind it, so a Windows service's `recovery.probeApplication` can lift a persisted quarantine once the recorded application process is proven to have exited. The helper answers `exited` only when the process id names no process, the process holding it has exited, or it names a process created more than one second later; a creation time within 10 ms is `running`, and access denied or anything else is `unknown`.
- bac8b51: Implement bounded observation in the Windows helper. `observe` pages each family of UI Automation children with the cached tree walker, so the visited, depth, byte, and deadline budgets take effect between any two siblings, and a 10,000-item tree returns a partial sample instead of failing `tree-too-large`. Records that `observe` emits are pinned until `releaseElements` or their window ends, a full record table ends the sample with the `references` truncation instead of evicting them, and `releaseElements` drops only the named records. Password fields never report `value` or `text`. The helper negotiates `boundedObservation` in `hello` and `probe`, so agent operations now work on Windows.
- bac8b51: Harden the Windows helper: publish window lifecycle from WinEvent hooks, recheck input authority on every physical operation, never reuse element ids and bound retained elements with a fingerprint check before each action, treat a provider-reported UI Automation timeout on a mutation as indeterminate, refuse clicks that another application's window covers, and report provider failures with their named UI Automation results. Adds an opt-in plain Win32 fixture contract.
- bac8b51: Expose Windows UI Automation actions in bounded observation and support opaque keyed action execution with live pattern revalidation and mutation settlement.
- bac8b51: Scope the Windows helper's mutation quarantine to the application lease. Closing a launched application ends its quarantine once the helper has verified the process exited, as the service already does, so one unsettled call no longer refuses mutations for every later session until the helper restarts. An attached application keeps running and stays quarantined. Adds an opt-in `protectedService` native contract that serves the Win32 fixture through a grant-protected service with the real helper behind it.
- bac8b51: Report the FDR1 mutation `effect` from the Windows helper on every failed or cancelled mutating command. An effect ledger counts each UI Automation pattern action and value write and every key, button, wheel, close, and window-placement change Windows accepts, so a rejection reports `none`, a command stopped after part of it landed reports `partial`, and a provider call that never settled or failed ambiguously reports `unknown`. A cancel for a queued mutation, or for an id the helper does not hold, reports `none`. The gated native test now checks effect reporting against the Windows helper as well as the macOS one.
- bac8b51: Add a Windows owner-only private storage adapter and service identity verifier for private connection descriptors. `createWindowsPrivateStorage`, `describeWindowsService`, and `createWindowsServiceVerifier` call two new restricted one-shot modes of the Windows helper, `--private-storage` and `--service-identity`. The storage mode checks the owner, the protected DACL, the ancestors, reparse points, hard links, the volume, and the pinned root identity from open handles, and publishes without replacing a record. The verifier mode checks the live process start time, executable, user, and interactive session and that the claimed process alone owns the loopback listener, so a credential is sent only to a verified service. Adds native self-tests and opt-in `privateStorage` and `serviceIdentity` native contracts.
- bac8b51: Add a Windows helper self-test that drives the stdio host over in-process pipes and shows that cancelling a queued mutation reports `effect: none`, cancelling a queued read reports no `effect`, and neither cancelled request ever runs. The Windows helper documentation now describes `SendInput` as completed injection into the input stream rather than application handling, so a `partial` effect needs authoritative re-observation.

## 0.4.2

### Patch Changes

- f6a26b9: List the accessibility actions an element publishes through a new `accessibilityActions` element property, gated by the `accessibilityActions` entry in `furn:features`. The macOS provider reports authored custom actions such as `Toggle` and `Select` by name without exposing provider handles, while Windows and Win32 keep returning `unsupported operation`. The property only lists actions; it does not invoke them.

## 0.4.1

### Patch Changes

- 8fb422f: Route WebdriverIO element.takeScreenshot() through the element screenshot endpoint instead of capturing the entire window.
- fe236bf: Expose authoritative Windows accessibility help text for legacy desktop tests
  and align the FluentTester Windows SDK and launch title across native dependencies
  and the desktop harness.
- fe236bf: Move to WebdriverIO 10.1 and expect-webdriverio 8, replacing the patched expect-webdriverio 5.6.1. WebdriverIO 10
  requires Node.js 22.19 or newer. Desktop Driver now passes the `{ attachToElement: true }` option object that
  WebdriverIO 10 requires when it overwrites element commands. WebdriverIO 10 also makes selectors strict by default, so
  a selector that matches several elements now throws; see the desktop-test WDIO suites reference for the opt-out. Storybook
  Desktop no longer depends on `@wdio/logger`, which only satisfied the old expect-webdriverio peer requirement.

## 0.4.0

### Minor Changes

- d690e1c: Add an application-neutral desktop-test harness with canonical app/suite
  configuration, native lifecycle ownership, standalone WDIO/Jasmine execution,
  and shared event, JSON, JUnit, console, and GitHub Actions reporting.
  
  Make Storybook an optional integration while preserving isolated callbacks,
  authenticated readiness, platform exclusions, and owned PowerShell services.
  Bind native visibility/focus to existing WDIO browsers, retain delayed-render
  waits, strengthen Windows attach identity, and forward trusted launch timeouts
  and unpackaged working directories.
  
  Expose authoritative UI Automation required-form state, preserving unsupported
  results on other providers. Adapt native checkbox/switch reads to checked state
  without changing selected semantics or legacy Appium behavior.
  
  Expose the FluentTester application's canonical desktop targets for referenced
  standalone suites without importing test or Storybook tooling into the app.
  
  Legacy desktop Appium and mobile lanes remain until native semantic parity and
  multi-day reliability qualification are complete.

### Patch Changes

- cfa4c66: Write TypeScript build information to `node_modules/.cache` instead of `.cache`, so
  incremental build state is no longer included in published packages.
- cfa4c66: Add package-owned agent guidance, user entry points, and indexed references to
  design and framework-base. Design's completed plan is removed and its open
  theming work moves to `references/remaining-work.md`. Both packages now restrict
  published contents with a `files` allowlist. Desktop Driver guidance now tracks
  unfinished work in a remaining-work reference.
- e2092f9: Make Windows physical clicks robust to another absolute pointing device, such as a remote-desktop or virtual-machine
  viewer, that moves the cursor back after injection. Pointer placement now confirms the cursor reached the target and
  retries before pressing, element clicks inject the press and release as one coordinate-carrying batch, and pointer
  actions carry their coordinate on every press and release. Previously such a device could redirect the press to its
  own cursor position, activating another window and leaving text inputs unfocused.
- e2092f9: Report macOS elements that do not publish `AXEnabled`, such as React Native
  Paper views without an explicit disabled state, as enabled so they can be
  clicked and queried. Diagnose a locked or switched-out macOS login session:
  launch, attach, window discovery, and new physical input fail immediately with
  an explicit session diagnosis, and `doctor --permissions` reports the session.
  
  Record macOS window notifications and recent helper commands in a bounded
  diagnostic timeline exposed through `furn/window-events`, publish
  `window-closed` events, and describe transient windows by role, frame, and
  WindowServer identity. Activate macOS targets through Accessibility instead of
  waiting about a second for cooperative workspace activation, and name the
  occluder of an intercepted click. Add `captureDesktopFailureEvidence`, which
  captures window events first and then the current and other open windows.
  Attached WebdriverIO sessions now use explicit wait defaults so `waitUntil`
  polls until its timeout instead of stopping after the first poll.
- e2092f9: Retry a Windows accessibility subtree read when a descendant disappears mid-read, such as an owned popup island
  closing, while its root remains available. Only an unavailable root reports a stale element.
- d690e1c: Add package-owned agent guidance and user entry points, and restrict published
  contents to the package files required at runtime and for documentation.
- 60121de: Present Popover on Office Win32 through a new `Callout` adapter in native-core's `win32` entrypoint. The adapter
  implements the modern props and presentation handle over the host's existing Callout registration and sends it no
  new commands. It supports view anchors only, and its popup sits flush against the anchor. The host draws the surface
  fill and corner radius, because its popup window has no per-pixel transparency. On Win32 the Popover trigger also
  declares `Expand` and `Collapse` accessibility actions, so UI Automation exposes its expanded state.
  
  On Windows, the modern Callout popup window now has rounded corners and the platform popup shadow. A press on the
  live view anchor no longer light-dismisses it before the anchor handles that press.
  
  The Windows desktop driver no longer reactivates a window whose owned popup is in the foreground. It also retries a
  subtree walk when a closing popup's UI Automation provider reports a transient failure.
- 60121de: Present Menu and MenuButton on Windows and Office Win32. On Windows, the modern Callout now implements
  `tabNavigation`: Tab or Shift+Tab in any popup of a nested family closes the whole family and either keeps focus at
  the owner (`dismiss`) or moves it past the anchor (`continue`). Closing an outer Callout also closes the Callouts
  nested in it, and focus requests treat a nested popup's owner window as active.
  
  Native-core's `win32` entrypoint adds a `FocusZone` adapter over the host's FocusZone registration. Its `Callout`
  adapter adds `initialFocus`, keeps the popup's focus and key events from bubbling to its owner, and closes the
  outermost popup on Tab. On Win32, Menu handles Home and End itself, and MenuButton returns Tab to its trigger.
  Because the Win32 host reports a pointer leave together with its enter, a pending submenu change there survives the
  leave until another row is hovered.
  
  The Windows desktop driver injects a character that one unmodified key of the foreground keyboard layout types as
  that virtual key, so key-based handlers such as type-ahead match it.

## 0.3.0

### Minor Changes

- 8d31a6b: Add opt-in executable WebdriverIO callbacks in React Native stories, Storybook-owned test configuration, isolated Node execution, and Button examples.
- 5b3f74c: Build the source-shipped native desktop helper explicitly, reuse verified
  content-addressed artifacts, and add the Windows/Win32 C++ and macOS Swift
  providers. Storybook can build the helper independently, ensures it during
  prep, and attaches authored smoke tests to the exact app process it launched.
  macOS cache resolution pins stable signatures to the leaf certificate and
  designated requirement, makes source builds reproducible, verifies Hardened
  Runtime and secure timestamps, reports TCC/AX diagnostics, and normalizes Fabric
  accessibility roles, window identity, input, and Retina ScreenCaptureKit
  evidence.

### Patch Changes

- 5b3f74c: Add the native macOS and Windows implementations, explicit native build
  verification, and prebuilt-only Storybook PR pipeline integration for the
  desktop-driver package. Keep the FocusZone Windows WinMD compatible with the
  consuming Storybook application's target SDK.
- 8d31a6b: Capture ordered per-command stdout/stderr logs, replay full output on failure or in verbose mode, and report contextual story navigation and test failures with nested causes.
- 65245b4: Add ref-backed focus targets and cancellable focus requests, shared focusable pressable behavior, live focused-owner modality subscriptions, and shared-controller popup input boundaries. Migrate agentic components and commit TabList eligibility before requesting native focus. Preserve native activation, adapt unidentified Win32 key codes without duplicate presses, and expose Toggle/Select accessibility actions. Add owned targeted native focus qualification through smoke story/tag selectors.
  
  Keep the focusable pressable implementation native-only so React-only Framework Base consumers can load the generic entrypoint without importing the React Native runtime.
  
  Separate native keyboard press cleanup from activation pairing, preserving macOS keydown activation and clearing pressed feedback after interruption, blur, disable, or target replacement. Centralize endpoint-specific accessibility action contracts in Framework Base, and execute shared focus stories on macOS with narrowly scoped Windows-only pointer assertions.
  
  Carry owned modifier state on macOS native input events so rapid WebDriver chords such as Shift+Tab are delivered correctly.
  
  Clarify that FocusZone uses geometric directional navigation on macOS, while Windows and Win32 opt into geometry with use2DNavigation.
  
  Coalesce same-instance callback-ref handoffs without changing snapshots or mount generations, while rejecting detached-target activation immediately. Track repeated native key events separately from held physical keys so a single modifier release cannot leave later input modified.
- 8d31a6b: Add named, individually isolated WDIO story tests with target-platform context and test-name filtering. Migrate Button's declarative desktop-driver plans to executable WebdriverIO callbacks.

## 0.2.0

### Minor Changes

- 59b6003: Add the platform-neutral W3C desktop driver and integrate Storybook manifests,
  authenticated runtime readiness, deterministic preview resets, and same-process
  driver supervision. Add portable Button, Checkbox, and Input story plans for
  WebdriverIO and agent validation. Desktop Storybook smoke runs can now either
  traverse the complete catalog or traverse it and then execute the authored
  desktop-e2e plans.
  Smoke startup now waits through the initial Metro compilation, macOS cleanup
  terminates the exact bundle-identifier process, and Windows CI installs the
  required Windows App Runtime while the shared registration lifecycle installs
  the SDK-provided Debug VCLibs frameworks.
