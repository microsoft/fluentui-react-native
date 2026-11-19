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

Do not introduce a public package that needs unreleased workspace dependency
changes at the versions it will publish with. Release those dependencies first
or publish their bumps together with the new package. Version PRs regenerate
automatically after the source changes land; make corrections in the changesets.

The PR publish dry run runs `yarn smoke:desktop-tarballs _packed` when there
are tarballs. It installs new desktop tarballs together in a fresh consumer,
imports their public entry points, and checks their CLI help. This does not
replace target-OS builds or native tests.
