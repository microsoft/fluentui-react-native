# Config module agent guidance

Read [README.md](./README.md) before editing this module.

## Responsibilities

This module owns the versioned project schema, config loading, strict validation, path resolution,
environment provenance, config fingerprints, and projections into Storybook, WDIO, server, and the
React Native runtime.

## Editing rules

- Keep `config/index.ts` data-only and safe for Storybook configuration evaluation.
- Keep Node filesystem and loader behavior in `config/node.ts`.
- Reject unknown keys.
- Validate every platform block, not only the selected platform.
- Resolve relative paths from the config file.
- Canonicalize existing inputs and confine outputs to `rootDir`.
- Never print resolved environment values; provenance may include variable names only.
- Platform overrides must not change discovery inputs.
- Change `DESKTOP_CONFIG_SCHEMA_VERSION` when defaults, merge rules, or path semantics change.
- Update the config fingerprint whenever a new field affects discovery or executable output.

## Documentation

Update:

- package `README.md` for the public config example;
- `USAGE.md` for detailed config/override behavior;
- `DESIGN.md` for schema or generation invariants;
- this module `README.md` for internal resolution changes; and
- `apps/storybook/desktop.config.ts` when the reference config needs a new field.

## Validation

Cover TypeScript, JavaScript, and JSON loading; alternate working directories; unknown keys;
invalid all-platform values; path containment; manifest references; provenance; fingerprints; and
the exact WDIO spec projection.
