# Desktop Test agent instructions

This package owns neutral app/suite configuration, desktop lifecycle, and
aggregate reporting.

## Start here

Read the [user guide](README.md), then select the narrowest topic in the
[reference index](references/README.md). For configuration work, begin with
[configuration](references/configuration.md); for reports and run status, use
[reporting](references/reporting.md).

## Invariants

- Keep the harness application-neutral: no Storybook, React, or React Native
  dependencies. Storybook is introduced only by the optional integration.
- Preserve exact application identity and ownership semantics. Reject unknown
  config fields and invalid app/suite references.
- WDIO owns suite sessions. Do not create competing WebDriver sessions from
  hooks.
- Cleanup only resources whose ownership was recorded; interactive runs use
  the per-user workload lock.
- Never count skipped capabilities, empty work, or incomplete work as passing
  coverage.
- Keep published API changes explicit and update the owning reference with the
  implementation.

## Validation

Run the package scripts: `yarn format`, `yarn lint`, `yarn build`, and
`yarn test`. For changes to native lifecycle or consumers, follow the
qualification matrix in `references/contributing.md`. Add a patch changeset
for this published package and finish code/configuration changes with
`yarn clean-lage-cache` followed by `yarn lage buildci`.
