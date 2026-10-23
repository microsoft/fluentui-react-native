---
id: repository.package-guidance
kind: instruction-reference
owner_paths:
  - references/agents/repository
---

# Package-owned guidance

This standard applies to the packages listed in the adjacent
`package-guidance-packages.json`. Other workspaces do not yet need to comply;
add a package to the registry when it adopts this standard.

## Content ownership

- **R-PKGDOC-001:** Each governed package has a root `AGENTS.md` for agents and a root `README.md` for users. The README links to the agent entry point. Both link to package references where applicable.
- **R-PKGDOC-002:** Package knowledge and reusable recipes live once in the owning package's `references/` directory, indexed by that directory's README. Skills and entry points link to references rather than duplicate schemas, commands, or troubleshooting.
- **R-PKGDOC-003:** The package that implements a behavior owns its guidance. Consumers retain app-specific configuration and link to the owner.
- **R-PKGDOC-004:** Each package reference Markdown file has the standard frontmatter and a stable, globally unique ID. Its package index lists the ID, document, and a concrete "Read when" condition.
- **R-PKGDOC-005:** Relative Markdown links in shipped package guidance resolve inside the same package. Cross-package references use the package name and package-relative path in code spans; repository rules use rule IDs.
- **R-PKGDOC-006:** Project skills live in root `.github/skills/`. A skill is a concise router to package references and repository safeguards, not a second home for package knowledge. Delegated tasks receive required entry-point and reference paths explicitly.
- **R-PKGDOC-007:** Changes to behavior, commands, configuration, outputs, or contracts update the owning reference in the same change, and update `AGENTS.md` or `README.md` when their entry-point information changes.
- **R-PKGDOC-008:** Published packages include their `AGENTS.md`, `README.md`, reference index, every reference document, and local linked assets. Validate the actual Yarn pack inventory; build caches and generated artifacts must not ship.
- **R-PKGDOC-009:** Governed packages have no `PLAN.md` or other plan files outside `references/`. Unfinished or explicitly deferred work lives in an indexed `<package>/references/remaining-work.md`. When work completes, move durable behavior into the owning reference and delete the item rather than marking it done; delete the file when no work remains.

## Package entry points

`AGENTS.md` is the concise agent router: package scope, invariants, a
task-to-reference map, and validation. Keep source/test maps and detailed
recipes in references. `README.md` serves package users with purpose,
installation/use quick start, and links to the package references. Neither
duplicates the full recipe corpus.

Each package reference index uses frontmatter with `kind: index` and lists:

| ID  | Document | Read when |
| --- | -------- | --------- |

Reference frontmatter follows the repository-wide three-key format. IDs use
`<package-basename>.<topic>` and remain unchanged when a file moves.

## Skills and package links

Copilot CLI inherits skill directories from parent `.github/skills/` locations,
not child package directories. Keep runnable skill entry points in the
repository root. Skill descriptions must be valid YAML, name their task
boundary, and remain within the checker word limit.

In package references, use relative links only within the same package. To
point at another package, write its npm name and the path from its package
root, for example:

`@fluentui-react-native/desktop-test/references/configuration.md`

Do not use workspace-sibling Markdown paths: a published tarball has no sibling
workspace. The checker resolves package-qualified code spans against the
workspace registry. Cite repository guidance by rule ID, or by reference ID in
a code span such as `focus.common`, rather than by a repository path.

## Remaining work

`<package>/references/remaining-work.md` uses the standard reference frontmatter with the
`<package-basename>.remaining-work` ID. List each open item with its outcome,
current evidence, owning issue when one exists, and the condition that
completes it. Keep design rationale for implemented behavior in the owning
reference, not in the remaining-work file.

## Validation

`yarn check-agent-instructions` validates registered package entry points,
reference metadata, indexes, internal links, skill routing, rule definitions,
and evaluation cases, and rejects plan files outside a package's `references/`. `yarn check-package-contents` uses Yarn's real
`pack --dry-run --json` inventory to verify published file inclusion. Run the
package's `format`, `lint`, `build`, and `test` scripts for source changes.
Before a release, run `yarn check-publishing` and inspect the package inventory.
