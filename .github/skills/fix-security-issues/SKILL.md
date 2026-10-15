---
name: fix-security-issues
description: Audit and remediate dependency security advisories while respecting package age policy, removing unused vulnerable capabilities, deduplicating Yarn resolutions, and validating affected tooling.
license: MIT
---

# Fix security issues

Use this skill for dependency vulnerability remediation, Dependabot alerts,
Yarn audit findings, or security-driven package upgrades. Detailed commands and
procedures are in the [dependency security reference](../../../references/agents/repository/dependency-security.md); read each linked
section when you reach that step.

## Safeguards

- **R-SEC-001:** Do not disable or reduce the age gate to obtain a security fix.
- **R-SEC-002:** Do not add a broad catch, audit exclusion, or warning suppression in place of a runtime fix.
- Do not edit `yarn.lock` manually. Change the owning manifest, catalog,
  resolution, preset, or extension and let Yarn regenerate the graph.
- Treat critical and high findings as required fixes. Address moderate and low
  findings whenever a compatible, policy-eligible remediation exists.
- Use `ignore:` only for a capability proven unused that fails closed; never
  ignore a package merely to make the audit output clean.

## Workflow

1. Read the repository `AGENTS.md` and the owning workspaces' instructions.
   Inspect `package.json`, `.yarnrc.yml`, `yarn.lock`, package catalogs,
   resolutions, package extensions, dynamic package extensions,
   `.github/dependabot.yml`, any repository-specific package age, cooldown,
   registry, or release policy, and the declared scripts for every affected
   workspace before choosing validation commands.
2. [Inventory the complete problem](../../../references/agents/repository/dependency-security.md#inventory-the-complete-problem) with
   the full recursive audit, `yarn why`, and runtime-use analysis.
3. [Enforce the package age policy](../../../references/agents/repository/dependency-security.md#enforce-the-package-age-policy) with
   an exact cutoff for every newly selected version.
4. [Choose the least risky complete remediation](../../../references/agents/repository/dependency-security.md#choose-the-least-risky-complete-remediation):
   direct dependency, transitive parent, narrow root resolution,
   [`ignore:`](../../../references/agents/repository/dependency-security.md#safely-use-the-ignore-plugin), then a local Yarn patch.
5. [Resolve, audit, and deduplicate iteratively](../../../references/agents/repository/dependency-security.md#resolve-audit-and-deduplicate-iteratively).
6. [Validate the affected behavior](../../../references/agents/repository/dependency-security.md#validate-the-affected-behavior), add a
   normal or empty changeset as required by repository policy, and finish with
   `yarn clean-lage-cache` and then `yarn lage buildci` (R-VALID-003).

Finish by confirming:

- the recursive audit has no unexplained findings;
- every critical/high advisory is fixed, removed, or blocked fail-closed;
- newly selected npm versions satisfy the exact package age cutoff;
- `yarn dedupe --check` reports no candidates;
- immutable install succeeds;
- the diff contains no unrelated manifest or generated-file changes.

## Failure behavior

If a required package has no eligible patched release, cannot be safely
ignored, and cannot be patched with a focused regression test, report the
remaining advisory and its exposure plainly. Do not claim completion, weaken
the age policy, force an unvalidated incompatible major, or suppress the
warning.
