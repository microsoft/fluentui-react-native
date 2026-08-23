# Storybook discovery agent guidance

Read [README.md](./README.md) before editing.

## Static discovery contract

- Parse story source; never execute it.
- Accept only supported literal `parameters.desktopTest` declarations.
- Preserve Storybook-compatible ID behavior.
- Keep inline plans and linked specs as distinct authoring modes.
- Require exact linked-suite tags and at least one runnable test.
- Keep persisted paths relative and POSIX-normalized.
- Preserve the config fingerprint and executable-content digest.
- Write generated runtime/spec files before the manifest commit marker.
- Fail empty discovery by default.

The running channel and coordinator do not belong here; use `server/channel` and
`server/coordinator`.

## Documentation

Update package `README.md` and `USAGE.md` when story authoring changes, `DESIGN.md` for digest or
security changes, and this README for parser/generator internals. Update the agentic component
story-authoring instructions when component authors must change declarations.

## Validation

Cover IDs, duplicate detection, malformed literals, linked tags, path containment, config drift,
transaction failure, and cross-platform deterministic digest behavior.
