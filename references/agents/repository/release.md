---
id: repository.release
kind: instruction-reference
owner_paths:
  - .changeset
  - .github/scripts/change.mts
---

# Changesets and release

- **R-REPO-003:** A change to a published package needs a changeset from `yarn change`, or an empty changeset
  (`yarn changeset --empty`) when no release is needed. Never bump a private package or introduce a major version.

`yarn change:check` validates changesets in CI. The check in [change.mts](../../../.github/scripts/change.mts) requires
changesets for changed public packages and rejects private-package and major bumps. Configuration lives in
[`.changeset/config.json`](../../../.changeset/config.json).

GitHub Actions opens version-bump pull requests automatically; `yarn changeset:version` applies version bumps.
Publishing runs in Azure Pipelines through `.ado/azure-pipelines.publish.yml`.
