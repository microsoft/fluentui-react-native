---
id: skills.distribution
kind: instruction-reference
owner_paths:
  - packages/agentic/skills
---

# Skill distribution and compatibility

## Ownership

The four public workflows, shared portable references, and reviewed catalog are
authored and tracked inside this package. They ship byte-for-byte, without
export-time path rewriting or copies from the repository knowledge base.
Generation writes only root discovery adapters, plugin manifests, license, and
provenance. The adapters are checked in so clean repository checkouts discover
the public workflows before any build. They delegate to canonical package
sources and must never become another authored authority.

The suite owns workflow orchestration, package selection, and shared public
guidance. Implementing packages own APIs, protocols, contracts, and exact
commands. Repository-only policies and remaining-work ledgers are not bundled.
Source paths in evidence are inspected-source locators, not required consumer
working-tree paths. Permission to read a source is not permission to republish it.

## Consumer resolution

Select the consuming workspace before resolving dependencies. Read its
installed package documentation, inspecting package versions and the selected
public entry point. The catalog explicitly declares allowed package documentation paths;
provenance records inspected source versions, not an unbounded promise for
future versions. A version mismatch requires
checking the installed documentation and relevant contract; missing or
incompatible resources stop the dependent operation with an explicit reason.

Only the selected route's packages are needed. Choosing packages and drafting
an original contract can precede runtime installation. Storybook is optional,
not a requirement for every desktop test. The suite never installs dependencies
or substitutes latest-branch manuals automatically.

Readable npm/pnpm layouts and source workspaces are the initial reference
resolution scope. PnP archives or client-inaccessible files are unsupported
until separately qualified; do not change the linker or unplug them silently.
An installed package's `AGENTS.md` is not assumed to be automatically loaded.
FURN contributor commands apply only when working on FURN.

## Installation

The explicit installer materializes skill entry points and one shared
knowledge tree, rebasing skill links to that tree. Its ownership record lists
file hashes. It preflights every collision before writing, rejects symlinked
destinations and modified managed files, and never overwrites unrelated
content. Re-running the same installation is idempotent.

For Copilot/Codex the project target is `.agents`; for Claude it is `.claude`.
Do not install both targets for the same host: Copilot can discover multiple
locations. The installer does not configure hooks, global settings, MCP, or
client permissions. Review the copied guidance before trusting it.

For a clean consumer, check all four discovered names, the activated file
location, and shared reference reads. Separate static discovery from model
invocation and from actual native qualification. Qualify plugin manifests,
client versions, and claimed operating systems explicitly; no universal
precedence or caching behavior is assumed.

## Contributor validation

In the FURN source workspace, `yarn prebuild` regenerates adapters and metadata;
`yarn lint` detects drift in those derived files; `yarn test` exercises
installation. `prepack` validates canonical sources and regenerates only
derived files, including clean checkouts. It never rewrites public source.
No install-time lifecycle script runs for consumers.

The root instruction check validates source routing, metadata, prerequisites,
and package-contained public resource closure, and reports
description/body/reference sizes with `--verbose`. Resolved realpaths cannot
escape the package, and symlinked public resources are rejected. External
package documentation must be explicitly allowlisted in the catalog; repository
policies, contributing guides, and status ledgers are not public prerequisites.
Historical source paths in identified evidence references remain observations,
not resource dependencies. These static checks do not sandbox agent tools.
The pack check verifies canonical and derived file inclusion using Yarn's
actual pack inventory. Metadata and boundary tests live in the repository
scripts workspace. New published content requires a changeset.

Keep the 60-word description and prerequisite-depth-three constraints. Report
body bytes, shared reference bytes, and catalog sizes separately; do not equate
file reuse or line count with saved model tokens. No new hard token budget or
evaluation framework is introduced.

Stable names, document IDs, source hashes, and the activated path permit future
source-versus-installed evals. Existing fixture skill names are migrated
mechanically; holdout prompts and assertions are not tuning material.

## Client conventions

- [Agent Skills format](https://agentskills.io/specification)
- [Copilot plugins](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)
- [Codex skills](https://developers.openai.com/codex/skills)
- [Claude skills](https://code.claude.com/docs/en/skills)
- [Claude plugin manifest](https://code.claude.com/docs/en/plugins-reference)
