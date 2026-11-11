# @fluentui-react-native/desktop-test

## 0.2.5

### Patch Changes

- c5ea4df: Allow nested desktop services to finish cooperative disposal and reporting before their outer service owners time out.
- 3b2787e: Make the desktop-test lifecycle and reporting contracts portable to Windows, including process cleanup and path projection.
- 586e4c3: Fix shutdown hangs and cancellation. An integration's run is no longer tracked in the scope it borrows, so a Storybook `serve` or story test exits after SIGINT instead of idling, and scope draining is bounded. Cancellation stops running stage and suite commands, including their POSIX process groups, reports them failed, and refuses late spawns. A second interrupt force-stops owned process trees, SIGHUP is handled, and handlers stay installed until cleanup completes; `handleDesktopInterrupts` exports that policy for integrations. On Windows, `taskkill` runs synchronously and only before the command's exit is recorded, so it cannot address a reused process ID. Close disposes services and resources in one reverse order even when an observer throws. Workload claims move to a per-user directory independent of TMPDIR and are replaced atomically; local sockets use short private paths. Generated WDIO configs read settings from a file, suites accept `suiteTimeoutMs`, and command arguments and environment reject NUL.
- 586e4c3: Fix verdicts that passed without coverage. A test takes the status of its decisive attempt, so a failed attempt followed only by skipped or unsupported retries stays failed. Selected worker work that reports no tests is `incomplete`, and the WDIO reporter warns when a spec ran no tests, with the jasmine and mocha framework loggers raised to `warn` so an import failure is visible. WDIO attempts keep their arrival order whatever numbers the runner reports. Console stalls, closed pipes, and queue overflow are warnings that no longer fail a passing run, and the final line comes from the terminal result. Incomplete runs list their unmet work and a JUnit message that names it, and result checks throw a typed `DesktopIncompleteError` that reporters record as the run's verdict instead of an infrastructure failure. Failures and late-registered secrets are sanitized once at finalization, and run-query errors use a closed code set without filesystem paths. NDJSON milestones no longer suppress a later failure after many skips, record IDs are not clipped, a projection failure still emits a summary record, `run.json` snapshots are throttled, and producers can no longer send `run-finished`.
- Updated dependencies [f14e254]
- Updated dependencies [1c38e27]
- Updated dependencies [586e4c3]
- Updated dependencies [8b3a2cc]
- Updated dependencies [f52682c]
- Updated dependencies [6404535]
- Updated dependencies [6404535]
- Updated dependencies [6b644ce]
- Updated dependencies [3b2787e]
  - @fluentui-react-native/desktop-driver@0.5.2

## 0.2.4

### Patch Changes

- 26cc577: Record partial combined-candidate macOS native qualification evidence.
- 138aed4: Report each command and step as a one-line outcome header with its duration and summary. Command output stays in its log and shows only when the step fails, in a verbose run, or inside a collapsed GitHub Actions group, and `runDesktopOperation` exposes the same headers to other producers. Neutralize workflow commands per line instead of wrapping every message in `::stop-commands::` fences, drop the per-message command identifiers, and remove the unused `@rnx-kit/reporter` dependency.
- 26cc577: Add typed resource contributions, settled shutdown, and exact fenced workload ownership records. Keep Storybook service waiters abortable so shutdown can drain them.
- 26cc577: Treat process-control socket resets after an intentional stop as expected shutdown while preserving unexpected transport failures.
- 26cc577: Document the provisional macOS native qualification evidence and integrated
  descriptor-path requalification procedure.
- 26cc577: Add cooperative owned Node service parent lifelines, explicit settled disposal,
  and per-command correlated typed service readiness. Storybook agent startup no
  longer treats a generated ready file as authoritative. Incomplete withdrawal or
  stalled disposal stays failed and fenced; native survivor qualification remains
  separate.
- 8574d22: Add modality-aware desktop test descriptors: `desktopIt` and `desktopDescribe` declare `requires`, `input`, `platforms`, `scope`, and known gaps for Storybook cases and, through `desktop-test/jasmine`, WebdriverIO Jasmine specs. `--input accessible|physical` (or `DESKTOP_INPUT`) runs one input lane, selects the cases that apply, masks the host for the accessible lane, and reports the lane and what it excluded.
- ac20660: Enforce input policy per WebDriver session and report case-level input mechanism receipts.
- 26cc577: Persist authenticated Storybook epochs beside settlement records in stable private target storage. Verify the exact live application incarnation before returning renderer-specific relaunch-required after a service restart; initial absence, replaced applications, and indeterminate probes remain bridge-unavailable.
- 26cc577: Run installed SIGTERM handlers when a parent lifeline stops a child without
  disposers, so Windows children flush their report terminal before exiting.
  Give the first manifest-backed smoke story a cold-bundle render budget, wait
  for authenticated runtime readiness before authored tests run in a relaunched
  smoke `tests` phase, and stop every owned smoke process before reporting a
  service cleanup failure.
- 26cc577: Repair Windows package-boundary validation, tolerate bounded atomic-report
  sharing conflicts without hiding persistent failures, and record descriptor-path cleanup,
  correlated render faults, recovery, and separate legacy smoke evidence, retaining
  earlier failures and partial native coverage.
- 319d38c: Record Windows Fabric and Win32 Paper launch, containment, and MCP measurement evidence, and document the Win32 agent-mode bundle, the Windows foreground refusal, and the `serve --agent` interrupt behavior.
- 26cc577: Record Windows Fabric and Win32 Paper native qualification results in the
  status ledgers and add Windows parameters to the native qualification runbook.
- Updated dependencies [26cc577]
- Updated dependencies [da2b62c]
- Updated dependencies [26cc577]
- Updated dependencies [26cc577]
- Updated dependencies [26cc577]
- Updated dependencies [26cc577]
- Updated dependencies [8574d22]
- Updated dependencies [ac20660]
- Updated dependencies [26cc577]
- Updated dependencies [319d38c]
- Updated dependencies [26cc577]
- Updated dependencies [26cc577]
  - @fluentui-react-native/desktop-driver@0.5.1

## 0.2.3

### Patch Changes

- bac8b51: Serialize MCP connection and session lifetimes, reverify authority after transport failures, and fence ambiguous acquisitions. Discover target launch modes, quarantine uncertain story changes, refuse ungoverned args updates on protected services, and retain workload claims after uncertain cleanup. Document the work-in-progress layering and package-owned capability, qualification, and measurement status.
- 388a60c: Add authorized bounded persisted run/status/artifact queries with opaque IDs, expiring read grants, explicit omissions, and fail-closed terminal evidence. Persist active collector snapshots without starting or replaying workloads when readers reconnect.
- bac8b51: Long-lived `serve`, `driver`, and `server` commands now write their bounded summary when they fail before readiness, instead of exiting with empty structured output. Integrations receive an `onReady` callback for `serve`. Storybook CLI tests no longer overwrite a live app's generated driver state. Records the live macOS paging and delta qualification.
- bac8b51: Let an imported integration serve `serve --agent` by declaring `supportsAgent`; `run` receives the agent descriptor options and, for `serve`, the output format for its readiness document. `startNativeDesktopService` accepts `agent` options to protect the driver and publish its agent connection.
- bac8b51: Add `desktop-test serve --agent`, which protects the served target with a grant authority and publishes the private connection descriptor the Desktop Driver MCP adapter reads.
- 0cfecf0: Add a dedicated native helper entry to desktop-driver and enforce the neutral desktop package dependency boundary with standalone consumer contracts.
- bac8b51: Add shared CLI reporter modes with bounded JSON summaries and NDJSON progress, propagate reporter settings to delegated commands, and emit Storybook readiness records only after service checks pass.
- cd0ede2: Share native service construction between the generic supervisor and Storybook
  channel child, wiring private durable settlement recovery, exact application-exit
  probes, protected descriptor lifetime and settled shutdown. Keep corrupt sibling
  journal records fenced rather than allowing a valid record to mask uncertainty.
- bac8b51: Treat empty reporter environment variables as unset and stop CLIs crashing when stdout closes, and make the Windows helper fail closed when a UI Automation mutation does not settle by reporting `mutation-indeterminate` and refusing later mutations with `target-quarantined`.
- bac8b51: Let `driver --agent` attach on Windows and Win32 without an application lease: the agent connection names the app's verified AUMID or REX executable, resolved through the new `resolveDesktopApplication(target, signal, { attach: true })` option, and the command fails before starting services when no identity can be verified. `driver` also serves Metro on a platform's declared fixed smoke Metro port, such as the RN Test App Windows Debug host's 8081, and fails clearly when that port is in use.
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [d50b1ea]
- Updated dependencies [0cfecf0]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [cd0ede2]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
- Updated dependencies [bac8b51]
  - @fluentui-react-native/desktop-driver@0.5.0

## 0.2.2

### Patch Changes

- 3b8430a: Stop redacting short environment values such as `true` or `0` from command output. Variables named like a token, secret, password, nonce, or authorization header are only registered as secrets when their value is at least 8 characters long, so machine-readable output like `"delegated":true` is no longer rewritten to `[REDACTED]`.
- ff3f961: Expose desktop-test and storybook-desktop config exports for installed dependency import
- c9998e3: Launch Windows command shims with escaped arguments without deprecated shell-backed spawn calls.
- Updated dependencies [f6a26b9]
  - @fluentui-react-native/desktop-driver@0.4.2

## 0.2.1

### Patch Changes

- fe236bf: Move to WebdriverIO 10.1 and expect-webdriverio 8, replacing the patched expect-webdriverio 5.6.1. WebdriverIO 10
  requires Node.js 22.19 or newer. Desktop Driver now passes the `{ attachToElement: true }` option object that
  WebdriverIO 10 requires when it overwrites element commands. WebdriverIO 10 also makes selectors strict by default, so
  a selector that matches several elements now throws; see the desktop-test WDIO suites reference for the opt-out. Storybook
  Desktop no longer depends on `@wdio/logger`, which only satisfied the old expect-webdriverio peer requirement.
- Updated dependencies [8fb422f]
- Updated dependencies [fe236bf]
- Updated dependencies [fe236bf]
  - @fluentui-react-native/desktop-driver@0.4.1

## 0.2.0

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
- d690e1c: Add package-owned agent guidance and user entry points, and restrict published
  contents to the package files required at runtime and for documentation.
- d690e1c: Fix macOS desktop runs: canonicalize the reporting root so artifacts under
  symlinked temporary directories stay confined, skip stop requests to producers
  whose Unix-domain sockets have already half-closed, and request the canonical
  desktop target that Storybook's embedded driver registers for Fabric and Paper
  smoke tests. macOS RN Test App sessions without explicit identity now launch
  the project's exact built product instead of any Launch Services copy sharing
  its bundle identifier, and fail closed when its bundle identifier, renderer, or
  embedded JavaScript bundle does not match. Console test labels number retried
  attempts by ordinal rather than by WDIO's sparse attempt keys.
- Updated dependencies [cfa4c66]
- Updated dependencies [cfa4c66]
- Updated dependencies [e2092f9]
- Updated dependencies [e2092f9]
- Updated dependencies [e2092f9]
- Updated dependencies [d690e1c]
- Updated dependencies [d690e1c]
- Updated dependencies [60121de]
- Updated dependencies [60121de]
  - @fluentui-react-native/desktop-driver@0.4.0
