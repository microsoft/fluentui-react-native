# Storybook Desktop Runtime agent instructions

This package owns the on-device Storybook runtime, bridge, Metro integration,
theme host, and chrome.

## Start here

Read the [README](README.md) and the narrowest section in the
[reference index](references/README.md). The runtime contract covers the
authenticated bridge, Metro, theme, and platform chrome.

## Invariants

- Keep this package as the on-device runtime. CLI orchestration and aggregate
  test reporting belong to the integration and harness packages.
- Preserve the authenticated nonce, correlated request/run IDs, readiness,
  error signaling, and native story-root verification.
- Keep one `ThemedRoot` around app content and chrome. Preserve explicit story
  background overrides and safe fallback behavior for opaque native colors.
- Keep platform-specific behavior in platform files. Preserve Win32's
  desktop-only chrome and keep macOS/Windows on upstream LiteUI.
- Metro configuration has side effects: loading it can generate the runtime
  polyfill. Do not treat config evaluation as a read-only probe.

## Validation

Run `yarn format`, `yarn lint`, `yarn build`, and `yarn test`. Changes to
runtime exports, platform selection, or Metro integration require validation
through the consuming Storybook app and its affected native platform.
Add a patch changeset for this published package when its shipped guidance or
behavior changes.
