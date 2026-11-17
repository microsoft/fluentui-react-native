---
id: skills.distribution
kind: instruction-reference
owner_paths:
  - packages/agentic/skills
---

# Skill distribution and compatibility

## Ownership

The four public workflows are authored in the FURN repository's root skill
directory. A reviewed export configuration selects those workflows and the
portable shared reference subset. Generation rebases bundled links and records
source/output SHA-256 hashes, stable document IDs, the source commit, and
catalog package versions. Generated files are never another authored authority.

The suite owns workflow orchestration, package selection, and shared public
guidance. Implementing packages own APIs, protocols, contracts, and exact
commands. Repository-only policies and remaining-work ledgers are not bundled.
Source paths in evidence are inspected-source locators, not required consumer
working-tree paths. Permission to read a source is not permission to republish it.

## Consumer resolution

Select the consuming workspace before resolving dependencies. Read its
installed package documentation, inspecting package versions and the selected
public entry point. The catalog records an exact inspected source snapshot,
not an unbounded promise for future versions. A version mismatch requires
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

In the FURN source workspace, `yarn prebuild` regenerates the distribution;
`yarn lint` detects stale or extra generated files; `yarn test` exercises
installation. `prepack` regenerates from source, including clean checkouts.
No install-time lifecycle script runs for consumers.

The root instruction check validates source routing, metadata, prerequisites,
and in-memory exported link closure, and reports description/body/reference
sizes with `--verbose`. The pack check verifies actual generated payload
inclusion using Yarn's pack inventory. Generator tests live in the repository
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
