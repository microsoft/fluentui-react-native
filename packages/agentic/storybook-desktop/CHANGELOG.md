# @fluentui-react-native/storybook-desktop

## 0.4.4

### Patch Changes

- 26cc577: Add typed resource contributions, settled shutdown, and exact fenced workload ownership records. Keep Storybook service waiters abortable so shutdown can drain them.
- 26cc577: Add cooperative owned Node service parent lifelines, explicit settled disposal,
  and per-command correlated typed service readiness. Storybook agent startup no
  longer treats a generated ready file as authoritative. Incomplete withdrawal or
  stalled disposal stays failed and fenced; native survivor qualification remains
  separate.
- 26cc577: Add local story-provider lifetime/cancellation context, authenticated connection
  epochs, versioned native marker conformance, prompt disconnect failure, and stale
  preview mutation rejection. Fence interrupted navigation conservatively and
  report renderer-specific bridge/relaunch failures without claiming transparent
  upstream reconnect or clearing unknown-effect quarantine.
- 26cc577: Disable alternate HTTP and WebSocket mutation ingress on agent-served Storybook
  channels, dispatch authorized selections only to the authenticated runtime, and
  retain explicit protected args refusal. Route manifest-backed smoke traversal
  through driver sessions and cover foreign-authority selection and args refusal.
- 8574d22: Add modality-aware desktop test descriptors: `desktopIt` and `desktopDescribe` declare `requires`, `input`, `platforms`, `scope`, and known gaps for Storybook cases and, through `desktop-test/jasmine`, WebdriverIO Jasmine specs. `--input accessible|physical` (or `DESKTOP_INPUT`) runs one input lane, selects the cases that apply, masks the host for the accessible lane, and reports the lane and what it excluded.
- ac20660: Enforce input policy per WebDriver session and report case-level input mechanism receipts.
- da2b62c: Close the upstream Storybook HTTP listener and its open connections when the legacy channel service stops, so lingering keep-alive or reconnect sockets cannot keep the channel process alive past its shutdown budget.
- 138aed4: Run story rendering and story tests as reported operations, so a smoke run shows one header with counts such as `209 stories rendered` and `101 of 101 story tests executed: 101 passed, 0 failed, 0 skipped`, and says `no story tests executed` when none ran. `--verbose` streams command output live; other runs keep it in the logs and show the end of a failing step's log.
- 26cc577: Persist authenticated Storybook epochs beside settlement records in stable private target storage. Verify the exact live application incarnation before returning renderer-specific relaunch-required after a service restart; initial absence, replaced applications, and indeterminate probes remain bridge-unavailable.
- 26cc577: Retire the old authenticated bridge when a reloaded runtime authenticates its
  new socket before the old socket closes. Pending work on the old socket is
  rejected with effect `unknown`, and the old socket cannot reclaim the bridge,
  instead of the new hello being dropped and selections reaching the stale socket.
- 26cc577: Run installed SIGTERM handlers when a parent lifeline stops a child without
  disposers, so Windows children flush their report terminal before exiting.
  Give the first manifest-backed smoke story a cold-bundle render budget, wait
  for authenticated runtime readiness before authored tests run in a relaunched
  smoke `tests` phase, and stop every owned smoke process before reporting a
  service cleanup failure.
- 319d38c: Record Windows Fabric and Win32 Paper launch, containment, and MCP measurement evidence, and document the Win32 agent-mode bundle, the Windows foreground refusal, and the `serve --agent` interrupt behavior.
- 26cc577: Report `bridge-unavailable`, not `relaunch-required`, while a relaunched
  runtime that has said hello awaits its initial `storyRendered`, so manifest
  smoke readiness waits keep retrying instead of failing before any dispatch.
- 26cc577: Write the Windows Storybook application lease before the manifest-backed stories phase, and release the traversal session before authored tests create their own session for the target.
- Updated dependencies [26cc577]
- Updated dependencies [da2b62c]
- Updated dependencies [138aed4]
- Updated dependencies [26cc577]
- Updated dependencies [26cc577]
- Updated dependencies [26cc577]
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
- Updated dependencies [319d38c]
- Updated dependencies [26cc577]
  - @fluentui-react-native/desktop-test@0.2.4
  - @fluentui-react-native/desktop-driver@0.5.1

## 0.4.3

### Patch Changes

- bac8b51: Serialize MCP connection and session lifetimes, reverify authority after transport failures, and fence ambiguous acquisitions. Discover target launch modes, quarantine uncertain story changes, refuse ungoverned args updates on protected services, and retain workload claims after uncertain cleanup. Document the work-in-progress layering and package-owned capability, qualification, and measurement status.
- bac8b51: Long-lived `serve`, `driver`, and `server` commands now write their bounded summary when they fail before readiness, instead of exiting with empty structured output. Integrations receive an `onReady` callback for `serve`. Storybook CLI tests no longer overwrite a live app's generated driver state. Records the live macOS paging and delta qualification.
- bac8b51: Add shared CLI reporter modes with bounded JSON summaries and NDJSON progress, propagate reporter settings to delegated commands, and emit Storybook readiness records only after service checks pass.
- cd0ede2: Share native service construction between the generic supervisor and Storybook
  channel child, wiring private durable settlement recovery, exact application-exit
  probes, protected descriptor lifetime and settled shutdown. Keep corrupt sibling
  journal records fenced rather than allowing a valid record to mask uncertainty.
- bac8b51: Treat empty reporter environment variables as unset and stop CLIs crashing when stdout closes, and make the Windows helper fail closed when a UI Automation mutation does not settle by reporting `mutation-indeterminate` and refusing later mutations with `target-quarantined`.
- bac8b51: Add `driver --agent` (with `--descriptor` and `--root`), which protects the embedded Desktop Driver, publishes an agent connection for the Desktop Driver MCP adapter, disables the channel's unauthenticated MCP endpoint, and keeps the macOS application lease current. `desktop-test serve --agent` now works for Storybook targets and reports readiness in structured output modes.
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
- Updated dependencies [388a60c]
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
- Updated dependencies [bac8b51]
  - @fluentui-react-native/desktop-driver@0.5.0
  - @fluentui-react-native/desktop-test@0.2.3

## 0.4.2

### Patch Changes

- ff3f961: Expose desktop-test and storybook-desktop config exports for installed dependency import
- Updated dependencies [f6a26b9]
- Updated dependencies [3b8430a]
- Updated dependencies [ff3f961]
- Updated dependencies [c9998e3]
  - @fluentui-react-native/desktop-driver@0.4.2
  - @fluentui-react-native/desktop-test@0.2.2

## 0.4.1

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
  - @fluentui-react-native/desktop-test@0.2.1

## 0.4.0

### Minor Changes

- fcc3b7f: Add a macOS-only `--paper` option to prepare, build, launch, and smoke test Storybook with Paper while preserving Fabric as the default renderer.
  
  Use centered alignment in macOS Paper CompoundItemLayout stories to avoid the native Yoga baseline crash without changing the primitive or Fabric demonstrations.
  
  Measure LayoutStableText's hidden reserve Text directly in native alignment stories, avoiding Paper Text-versus-View pixel-rounding mismatches without relaxing the geometry assertions.
  
  Deduplicate compatible Storybook React, theming, and shared UI dependencies in the lockfile after desktop UI updates, keeping strict Metro duplicate checks enabled.
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
- e2092f9: Capture the Desktop Driver's shared failure evidence for Storybook `wdio`
  callbacks, including the window-event timeline, a failure screenshot, and the
  screenshot and source of other open windows.
- Updated dependencies [cfa4c66]
- Updated dependencies [cfa4c66]
- Updated dependencies [e2092f9]
- Updated dependencies [e2092f9]
- Updated dependencies [e2092f9]
- Updated dependencies [d690e1c]
- Updated dependencies [d690e1c]
- Updated dependencies [d690e1c]
- Updated dependencies [60121de]
- Updated dependencies [60121de]
  - @fluentui-react-native/desktop-driver@0.4.0
  - @fluentui-react-native/desktop-test@0.2.0

## 0.3.1

### Patch Changes

- efd9477: Separate cold first-render waiting from service startup in the reusable smoke lifecycle, and report story navigation deadlines with their underlying causes.

## 0.3.0

### Minor Changes

- 65245b4: Add ref-backed focus targets and cancellable focus requests, shared focusable pressable behavior, live focused-owner modality subscriptions, and shared-controller popup input boundaries. Migrate agentic components and commit TabList eligibility before requesting native focus. Preserve native activation, adapt unidentified Win32 key codes without duplicate presses, and expose Toggle/Select accessibility actions. Add owned targeted native focus qualification through smoke story/tag selectors.
  
  Keep the focusable pressable implementation native-only so React-only Framework Base consumers can load the generic entrypoint without importing the React Native runtime.
  
  Separate native keyboard press cleanup from activation pairing, preserving macOS keydown activation and clearing pressed feedback after interruption, blur, disable, or target replacement. Centralize endpoint-specific accessibility action contracts in Framework Base, and execute shared focus stories on macOS with narrowly scoped Windows-only pointer assertions.
  
  Carry owned modifier state on macOS native input events so rapid WebDriver chords such as Shift+Tab are delivered correctly.
  
  Clarify that FocusZone uses geometric directional navigation on macOS, while Windows and Win32 opt into geometry with use2DNavigation.
  
  Coalesce same-instance callback-ref handoffs without changing snapshots or mount generations, while rejecting detached-target activation immediately. Track repeated native key events separately from held physical keys so a single modifier release cannot leave later input modified.
- 8d31a6b: Add opt-in executable WebdriverIO callbacks in React Native stories, Storybook-owned test configuration, isolated Node execution, and Button examples.
- 8d31a6b: Add named, individually isolated WDIO story tests with target-platform context and test-name filtering. Migrate Button's declarative desktop-driver plans to executable WebdriverIO callbacks.
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
- 8d31a6b: Navigate to each test's story before execution, bound navigation waits, and group static plans and inline WebdriverIO callbacks by story in desktop smoke tests.
- 8d31a6b: Wait for the authenticated Storybook preview to initialize before navigating after app startup or restart. Allow the aggregate WDIO subprocess contract enough CI time without relaxing individual callback deadlines.
- 8d31a6b: Fix loading WDIO settings from Storybook's source-config fallback before compiled JavaScript exists.
- 65245b4: Migrate all component catalog story tests to named WDIO callbacks and add Windows/Win32 focus contract coverage, including activation pairing, native target lifetime, nested modality, editable fields, TabList sequencing, and FocusZone navigation. Keep Node-only test helpers out of production emit, require story type coverage, preserve focused smoke filters, and allow worker HTTP handles to close naturally while retaining bounded cleanup.
- Updated dependencies [5b3f74c]
- Updated dependencies [8d31a6b]
- Updated dependencies [65245b4]
- Updated dependencies [8d31a6b]
- Updated dependencies [8d31a6b]
- Updated dependencies [5b3f74c]
  - @fluentui-react-native/desktop-driver@0.3.0

## 0.2.0

### Minor Changes

- 59b6003: Add reusable platform-aware configuration and CLI APIs for serving, preparing, bundling, building, running, and smoke testing desktop Storybook applications. The package now owns complete Windows Fabric and Win32 smoke lifecycles, native host launch, synchronized story traversal, desktop UX checks, process cleanup, and per-enlistment bundle and service isolation. React Native runtime code and peers are isolated in a companion package so Yarn's pnpm linker can invoke the peer-free CLI through a physical workspace locator.
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

### Patch Changes

- Updated dependencies [59b6003]
  - @fluentui-react-native/desktop-driver@0.2.0
