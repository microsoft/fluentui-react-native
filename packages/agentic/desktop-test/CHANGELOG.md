# @fluentui-react-native/desktop-test

## 0.2.4

### Patch Changes

- 8574d22: Add modality-aware desktop test descriptors: `desktopIt` and `desktopDescribe` declare `requires`, `input`, `platforms`, `scope`, and known gaps for Storybook cases and, through `desktop-test/jasmine`, WebdriverIO Jasmine specs. `--input accessible|physical` (or `DESKTOP_INPUT`) runs one input lane, selects the cases that apply, masks the host for the accessible lane, and reports the lane and what it excluded.
- Updated dependencies [8574d22]
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
