---
id: repository.dependency-security
kind: instruction-reference
owner_paths:
  - package.json
  - .yarnrc.yml
---

# Dependency security procedures

Detailed procedures for the [fix-security-issues skill](../../../.github/skills/fix-security-issues/SKILL.md). The skill owns the workflow, safeguards (R-SEC-001 and R-SEC-002), completion checklist, and failure behavior.

## Inventory the complete problem

Start with the full recursive audit rather than a partial summary:

```bash
yarn npm audit --all --recursive --json --no-deprecations
```

Normalize the output by severity, package, installed version, advisory, and
dependent. For every finding:

1. Read the advisory and identify the first patched version, affected
   functions, exploit preconditions, and whether a patch exists.
2. Run `yarn why <package>` to find every path. A fixed direct path does not
   help if a stale compatible transitive path remains.
3. Search repository source and installed dependent source to determine
   whether the vulnerable capability is used at runtime, only used by tooling,
   or unused.
4. Group duplicate advisories for the same package, but do not omit findings
   because one report calls them low priority.

Treat critical and high findings as required fixes. Address moderate and low
findings whenever a compatible, policy-eligible remediation exists.

## Enforce the package age policy

Before resolving versions, inspect the effective Yarn policy:

```bash
yarn config get npmMinimalAgeGate
yarn config get npmPreapprovedPackages
```

Calculate the exact cutoff from the session time. Verify publication timestamps
for proposed versions and, after lockfile generation, every newly selected npm
version in the lockfile diff.

- Never disable or reduce the age gate to obtain a security fix (R-SEC-001).
- Do not assume `latest` is eligible.
- Check preapproved-package exceptions explicitly; an exception does not prove
  that a newly selected release meets the requested age policy.
- Prefer the newest eligible fixed patch within the existing compatible range,
  not the newest package release overall.

## Choose the least risky complete remediation

Use this order:

1. **Upgrade the direct dependency.** Prefer a patched version within the
   current major and update the shared catalog when it is the source of truth.
2. **Upgrade the transitive parent.** This is preferable when the parent has
   already adopted the fixed dependency.
3. **Add a narrow root resolution.** Use the exact vulnerable descriptor when
   possible. Review API and module-format compatibility before forcing a new
   major, and exercise the dependent package's real code path.
4. **Remove an unused vulnerable capability with `ignore:`.** Use the installed
   `@rnx-kit/yarn-plugin-ignore` only after proving the package is not required
   by repository workflows.
5. **Carry a local Yarn patch.** Reserve this for required packages with no
   eligible published fix. Base it on authoritative upstream work, add a
   focused regression check, and document that version-based scanners may
   still report the patched version.

Do not add a broad catch, audit exclusion, or warning suppression in place of a runtime fix (R-SEC-002).

## Safely use the ignore plugin

The repository's `ignore:` protocol replaces a package with an empty module.
It is appropriate when a transitive dependency implements an optional
capability that this repository intentionally does not support, such as a
browser downloader in a native-only test path.

Before adding a resolution such as:

```json
{
  "resolutions": {
    "unused-vulnerable-package": "ignore:"
  }
}
```

prove all of the following:

- no repository source imports or invokes the package;
- each dependent imports it lazily or can load with an empty module;
- the unsupported capability fails closed if invoked;
- declared builds, tests, bundles, and CLIs do not require it;
- `yarn why` shows only the understood optional paths.

After installation, verify the npm package is absent from `yarn.lock`, the
`ignore:` locator is present, dependent modules still load, and an attempted
call cannot silently succeed. Never ignore a package merely to make the audit
output clean.

## Resolve, audit, and deduplicate iteratively

After each coherent manifest change:

```bash
yarn install
yarn npm audit --all --recursive --json --no-deprecations
yarn why <remaining-vulnerable-package>
```

Yarn may retain an older resolution that still satisfies a transitive range,
even when a fixed version is also installed. Once the remediation set is
complete, run:

```bash
yarn dedupe --strategy highest
yarn dedupe --check
yarn install --immutable --mode=skip-build
```

Re-run the audit after dedupe. If stale vulnerable paths remain, update their
owning range or add a narrow compatible resolution; do not assume another
dedupe pass will update a package with only one descriptor.

Keep related package families aligned. If repository lint expects an older
vulnerable version, update the shared alignment preset or catalog rather than
scattering exceptions or reverting the security floor.

## Validate the affected behavior

Use declared workspace scripts and validate in increasing scope:

1. Format changed manifests and configuration.
2. Run lockfile and repository structural lint.
3. Run affected workspace lint, build, and tests.
4. Exercise the runtime path affected by every major-version resolution.
5. Bundle each affected Metro/native target when bundler dependencies change.
6. Run the root build and repository test graph when shared manifests,
   catalogs, resolutions, or the lockfile change broadly.
7. Add a normal or empty changeset as required by repository policy.
8. Finish with `yarn clean-lage-cache` and then `yarn lage buildci` (R-VALID-003).

## Example

If `extract-zip` is present only through optional browser installation code
while the repository runs native desktop automation, inspect both dependents,
confirm their normal modules load without extraction, resolve `extract-zip` to
`ignore:`, regenerate and deduplicate the lockfile, then prove the browser
archive path fails closed and the native tooling still works.
