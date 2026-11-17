# Skills package agent instructions

This package owns the portable FURN workflow distribution, package-selection
catalog, explicit project-local installer, and source provenance. It does not
own runtime APIs, component contracts, or the agent evaluation runner.

Read the [user guide](README.md) and [reference index](references/README.md).

## Invariants

- Author workflows once in the repository's root `.github/skills/` directory.
  The export configuration selects sources; never hand-edit generated
  `skills/`, `references/shared/`, plugin manifests, or `provenance.json`.
- Package-owned API knowledge stays with the implementing package. Bundle only
  reviewed portable shared guidance, preserving reference and evidence IDs.
- Never apply FURN contributor policy to an unrelated consumer. Resolve
  optional package dependencies only for the selected task.
- Keep installation explicit, project-local, dependency-free, and
  collision-safe. Never change global client settings or install runtime
  dependencies. No hooks or install-time lifecycle scripts.
- Keep source and installed identities traceable without exporting eval
  fixtures, private material, machine-local paths, or raw telemetry.

## Validation

For changes to this package in the FURN repository, run `yarn format`,
`yarn build`, `yarn lint`, and `yarn test`, then the root instruction and
package-content checks. Add a changeset and finish with
`yarn clean-lage-cache` followed by `yarn lage buildci`.
These contributor commands do not govern consumers installing the suite.
