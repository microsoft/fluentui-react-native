# Storybook Desktop agent instructions

This package owns the Storybook integration CLI and runtime orchestration.

## Start here

Read the package [README](README.md), then select the closest topic in the
[reference index](references/README.md). Use `references/contributing.md` for
source ownership and validation.

## Invariants

- Keep app-specific identity, story discovery, and platform exclusions in the
  consumer app configuration.
- Keep Storybook-specific behavior here; general target configuration and
  aggregate lifecycle reporting belong to `@fluentui-react-native/desktop-test`.
- Only accept statically extractable story/test plans; invalid or dynamic
  plans fail generation.
- Preserve authenticated runtime readiness, correlated request/run IDs, and
  native story-root verification. Never accept uncorrelated channel events.
- Treat generated manifests, runtime state, native workspaces, and build
  products as disposable; fix their owning source.

## Validation

Run `yarn format`, `yarn lint`, `yarn build`, and `yarn test` from this package.
When changing story extraction or runtime behavior, run the relevant
`apps/storybook` manifest/bundle/smoke lane. Report each platform and renderer
separately; JavaScript tests are not native qualification.
