---
id: portable.context
kind: instruction-reference
owner_paths:
  - packages/agentic/skills
---

# Portable FURN workflow context

## Audience and package resolution

Identify the target application/workspace and whether the work changes that
application or contributes to FURN. Read its instructions. A published package's
maintainer commands do not govern an unrelated application, and installed
dependencies are not the workspace to edit.

A package-qualified reference such as
`@fluentui-react-native/design/references/theming.md` is a filesystem locator,
not a client feature or JavaScript import. Find the dependency from the target
workspace's dependency context, including its workspace/parent `node_modules`
and the real location of a pnpm dependency. Read its package manifest/version,
then the named document or its indexed stable ID. Do not assume a flat
repository-root installation, or rely on `require.resolve` of an unexported
`package.json`.

Published provenance records the source-snapshot versions used for these
workflows; in a source checkout, inspect local package manifests directly.
Verify a different installed version's documentation and relevant
contract before using it; report the mismatch. If a package/document is
missing or incompatible, stop only the dependent operation and explain what is
needed. Package selection and original contract drafting do not require all
runtime packages. Never install, fetch latest-branch manuals, or change the
package linker automatically.

The initial filesystem resolver supports readable npm/pnpm layouts and source
workspaces. Yarn PnP archives or client-inaccessible files are unsupported
until an explicit resolution path is qualified. Do not silently unplug them.

## Knowledge and local policy

Read only the selected topic and prerequisites. Package references own API
schemas and commands; the suite's shared references own cross-workflow
guidance. Stable IDs and source hashes connect copies to their canonical
sources. Historical paths in evidence identify inspected source, not a
requirement to have a FURN checkout.

When a package reference cites a shared ID such as `focus.common` or
`accessibility.action-transport-evidence`, use the source package's
`references/README.md`, or find its `id` and `path` in published
`provenance.json`, then read only that reference. In a project-local
installation, shared paths are relative to the configuration directory's
`furn/` folder. That provenance describes the original bundle;
`furn/installation.json` records actual installed paths and hashes after link
rebasing.

FURN contributions still follow root/scoped instructions: component-generation
classification, reviewed contracts, native overlays, focused checks, final CI
validation, and changesets. Other hosts supply their own layout, source
boundaries, contract format, and release rules. Do not guess scripts or copy
FURN paths into an application.

Keep package-specific assumptions explicit. React versions, Office integration,
renderers, token systems, and native registration are not universal React
Native requirements. Version-bound observations are evidence, not timeless
platform guarantees.

## Permissions and evidence

Do not install packages, change privacy settings, launch interactive native
workloads, capture unrelated windows, or access restricted sources without the
necessary authorization. Clean up only resources whose ownership was recorded.
Keep credentials and private source bodies out of outputs.

Report checks as passed, failed, skipped, not run, or unsupported. JavaScript
tests, mocks, and bundles do not qualify native behavior. Record the client,
activated skill identity, package/renderer versions, and actual evidence when
making behavior claims. No eval runner or automatic paid invocation is part of
this suite.
