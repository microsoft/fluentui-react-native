---
"@fluentui-react-native/desktop-driver": minor
"@fluentui-react-native/components": patch
---

Add `@fluentui-react-native/desktop-driver`: write-once WebdriverIO desktop tests for React Native Windows and React Native macOS, backed by an owned loopback single-driver host, a versioned portable command matrix, ownership-safe launch/attach lifecycles, and Storybook story-test generation. The agentic-components Button stories now declare desktop story tests as a proof of concept, using both an inline plan and a colocated shared spec.

One versioned `desktop.config.ts` now drives Storybook sources, static test discovery, generated artifacts, WebdriverIO, host startup, readiness, artifacts, and platform targets. A narrow generated runtime projection and RN-safe protocol entry keep Node configuration out of the application bundle.

Project loading now strictly validates every platform and nested key, canonicalizes existing inputs, confines outputs to the project root, and commits the manifest, generated spec, and React Native runtime projection as one generation. The packaged `stories list|select|args|smoke` commands replace app-owned Storybook REST clients, and host supervisors can consume resolved config plus atomic ready-file JSON.

Resolved config output includes non-sensitive source provenance, project manifests carry deterministic config fingerprints, and the package now requires Node 22.12 or newer so story discovery can use the native filesystem glob API.

WebdriverIO, Appium, Mac2, and NovaWindows now ship as runtime dependencies. NovaWindows replaces the unmaintained WinAppDriver backend, and `desktop-driver driver detect|verify` provides backend-aware setup verification without requiring an Appium driver registry or a separate Windows driver service.

Storybook now invokes the package CLI directly and uses a unique macOS bundle identity. Mac2 readiness queries application state instead of the unsupported window-handles route, and the shared Button story test uses macOS-visible status semantics while accounting for React Native macOS Fabric's missing AXEnabled projection.

`desktop-driver host` now owns Storybook's maintained channel/MCP server and a transport-free run coordinator in one process. Applications and clients use shared, validated channel contracts for readiness, run requests, ordered progress, results, cancellation, and shutdown. Run all uses one owned WebdriverIO invocation and warm session.

Server, channel, runner, and native WebDriver hosting code is consolidated under `src/server`; persisted manifests use relocatable paths; complete run reports are no longer truncated; attach lifecycle events describe session closure rather than application shutdown; and low-level CLI and driver-host package exports are removed.

The final reporting contract distinguishes skipped, cancelled, timed-out, failed, and infrastructure outcomes; writes startup and readiness diagnostics; merges per-spec workers; streams framework progress; scopes artifact captures; and keeps cleanup failures in the final result. Legacy announcement/HTTP transports and compatibility shims are removed, WDIO readiness/run context/standalone concerns are split, and published package contents exclude source, tests, and planning files.
