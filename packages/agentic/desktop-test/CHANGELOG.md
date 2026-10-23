# @fluentui-react-native/desktop-test

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
