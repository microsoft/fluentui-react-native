# Core contracts

`core/` contains small runtime-neutral modules that may be consumed by Node tooling, WDIO
integration, platform extensions, or React-Native-safe type surfaces without creating an upward
dependency.

## Files

- `session.ts` defines the minimal browser, element, and `browser.desktop` shapes used by portable
  commands and test doubles. It deliberately does not import WebdriverIO types.
- `reporting.ts` classifies failures, summarizes results, and maps test results to terminal run
  states.
- `loopback.ts` owns the loopback allowlist and URL host formatting used by config, CLI, server,
  and native host code.

## Invariants

- No imports from `wdio/` or `server/`.
- No Appium, Storybook, or React Native platform-fork imports.
- Result classification must remain consistent with `types.ts`, `junit.ts`, protocol codecs, and
  `run.json`.
- `attach` ownership semantics are not decided here; callers provide observed lifecycle reasons.

Add shared behavior here only when it is genuinely independent of a specific execution surface.
