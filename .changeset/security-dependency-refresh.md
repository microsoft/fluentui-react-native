---
---

Refresh vulnerable transitive dependencies and consolidate the pending Dependabot npm and GitHub Actions updates while preserving the seven-day release cooldown.

Keep both supported xmldom and js-yaml major lines patched. Update the existing body-parser resolution to pick up qs fixes, and narrowly override Appium's pinned morgan and sharp versions until its dependency pins adopt the patched releases.

Upgrade Changesets CLI and its action together, explicitly use the repository's oxfmt formatter, and retain the version-only workflow; package publishing remains in Azure Pipelines.
