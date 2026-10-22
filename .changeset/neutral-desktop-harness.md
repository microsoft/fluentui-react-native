---
'@fluentui-react-native/desktop-test': minor
'@fluentui-react-native/desktop-driver': minor
'@fluentui-react-native/storybook-desktop': minor
'@fluentui-react-native/tester': patch
---

Add an application-neutral desktop-test harness with canonical app/suite
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
