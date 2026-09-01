# Flex source and React Native component contracts

Flex component skills are authoring references, not files to ingest into this
package. Start an authoring session with:

```sh
agency copilot --profile flex-authoring
```

The profile in the repository root pins `flex-components`, `flex-system`, and
`flex-tokens` to the same self-consistent Marketplace commit. The package lock
records the Marketplace release and its immutable x3 source lineage. Plugin
versions are descriptive only; content identity comes from commits and file
digests. The canonical lock fingerprint binds all release commits, plugin
trees, and catalog entries so a repin cannot retain a stale component review.

For one component:

1. Invoke `flex-components:<name>` in the pinned session.
2. Draft the local `SPEC.md` and React Native companions under
   `src/components/<name>/`; classify source guidance as adopted, adapted,
   divergent, not applicable, or deferred.
3. Record immutable file identities with
   `yarn workspace @fluentui-react-native/components report:spec-source-drift --write --update-sources --component <name>`.
   This operation requires a GitHub token authorized for both private source
   repositories. Contributors without that access can work on an existing
   contract, but cannot create or repin source provenance.
4. Keep `status: contract-draft`, `conformance: review-required`, and
   `reviewedAt: null` while drafting. After an explicit pre-code review, use
   `status: contract-reviewed`, record the source surfaces actually consulted,
   and set the review date.
5. Build through the normal component pipeline, then set `status: implemented`
   only after ratifying the local contract against realized types, tests,
   stories, and platform evidence.

## Local foundational components

A theme-aware foundational component may have no entry in the Flex component
catalog. Keep it under `src/components`, retain the complete local contract and
evidence structure, and set `sourceKind` in `spec/source.json` to
`local-foundation`. Its sorted references identify the public platform contract
and repository evidence consulted during review.

Local-foundation contracts do not claim a `flex-components:<name>` skill,
source-lock identity, release differences, or candidate source drift. The
contract checker still enforces lifecycle, review date, divergences,
requirements, and realized evidence. Live and offline source reports include
the component with candidate status `not-applicable`.

There is intentionally no operation that copies a Flex skill into `specs/` and
no promotion step that moves a web-authored draft into production. The pinned
plugin is the session input; the first committed document is the independently
authored React Native contract.

## Contract lifecycle

| `status` / lifecycle | Conformance                                             | Evidence                                                                                          |
| -------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `contract-draft`     | `review-required`; no review date                       | Requirement IDs may name planned files.                                                           |
| `contract-reviewed`  | `reviewed`; review date and consulted surfaces required | The pre-code contract is approved; evidence may still be planned.                                 |
| `implemented`        | `reviewed`                                              | Every requirement names an existing type, implementation, test, story, or platform-evidence file. |

`availableSurfaces` is generated from the pinned source inventory.
`surfacesConsulted` is the reviewer's explicit assertion of what was opened; it
is never populated from availability by the generator. It may equal
`availableSurfaces` when every surface was reviewed. Source sidecars accept
only provenance, lifecycle, source-difference dispositions, divergence IDs,
and requirement evidence; upstream prose does not belong there.

`releaseDifferences` is non-empty when the Marketplace payload and its x3
lineage have different normalized content for the same role. Each difference
must be reviewed explicitly. `marketplace-authoring-input` means the pinned
plugin payload governs what the authoring session saw while the x3 digest
remains recorded for lineage.

## Authority

1. The pinned x3 commit identifies the original Flex design source for the
   release.
2. The pinned Marketplace commit identifies the exact skills presented to an
   Agency authoring session.
3. A reviewed local `SPEC.md` and its React Native companions define FURN
   behavior.
4. Public types, implementation, tests, stories, and platform evidence prove
   conformance to the local contract.

A newer Marketplace or x3 revision is a change proposal. It never rewrites a
local component automatically.

## Public content boundary

Commit source identifiers, paths, versions, dates, and digests. Write original
documentation for the public React Native API and behavior. Do not copy or
lightly rewrite Flex skill prose, rationale, tables, or token files without an
explicit redistribution decision from the source and repository owners.

## Source review

Run the credential-free check in any environment:

```sh
yarn workspace @fluentui-react-native/components check:spec-contracts
```

It validates local schemas, references, requirement evidence, and review state.
It does not claim that a private source is current.

With `GH_TOKEN` or `GITHUB_TOKEN` authorized for the curated Marketplace and
x3 source, generate a digest-only report:

```sh
yarn workspace @fluentui-react-native/components report:spec-source-drift --write
```

Use `--update-sources` during a deliberate release review to refresh file
identities, optionally scoped with `--component <name>`. Review source changes
before accepting the new metadata. Changing locked source identities clears
the prior review and intentionally makes `check:spec-contracts` fail for an
implemented component. Resolve every Marketplace/origin content difference,
review the new source, and then restore `conformance: reviewed`,
`surfacesConsulted`, and `reviewedAt`. A difference at mutable Marketplace or
x3 HEAD is reported as candidate drift and does not invalidate ratification
against the pin.

`--offline` prints a credential-free diagnostic with external state marked
`unchecked`. Add `--write` to refresh only locally derived lifecycle and
conformance fields while preserving the last committed live source evidence.
