# @fluentui-react-native/desktop-test

## 0.2.2

### Patch Changes

- 3b8430a: Stop redacting short environment values such as `true` or `0` from command output. Variables named like a token, secret, password, nonce, or authorization header are only registered as secrets when their value is at least 8 characters long, so machine-readable output like `"delegated":true` is no longer rewritten to `[REDACTED]`.
- c9998e3: Launch Windows command shims with escaped arguments without deprecated shell-backed spawn calls.

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
