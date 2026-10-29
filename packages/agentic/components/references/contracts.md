---
id: components.contracts
kind: instruction-reference
owner_paths:
  - packages/agentic/components/scripts/spec-contracts
  - packages/agentic/components/spec-source-lock.json
---

# React Native component contracts

Each higher-order component owns an original React Native contract in
`src/components/<name>/SPEC.md` and companion files under `spec/`. Source
material is evidence for authoring that contract; it is never promoted
mechanically into this public package.

Use the
`agentic-component-contract-authoring` skill to interpret Flex/X3, Fluent v9, HTML/CSS, visual, local-foundation, or
composite evidence. Use the component authoring skill after the contract has
passed its pre-code review.

## Why provenance stays JSON

`spec/source.json` is generated, digest-heavy, strictly validated metadata.
JSON provides unambiguous scalars, built-in Node parsing, deterministic atomic
rewrites, and no additional parser dependency. Generator rewrites would also
discard the main benefit of YAML comments. Keep this provenance in JSON.

`spec/tokens.yaml` remains YAML because it is concise, human-authored token
mapping data rather than a generated identity record.

The optional Checkbox assessor snapshot is separate from contract provenance.
It uses a strictly managed `assessment-*` block in the agentic Checkbox
`SPEC.md` front matter; full evidence, digests, and workflow identity remain
in the assessment JSON/report. It never changes `status`, `spec/source.json`,
requirements, or review approval. Only a matched clean execution may populate
its tested commit; local unverified snapshots leave that field null. The
repository-only `@fluentui-react-native/scripts/CONTROL-ASSESSMENT.md` guide
defines generation, fingerprinting, and trusted two-file publication. These
assessment fields do not apply to legacy CheckboxV1.
Generated Checkbox assessment reports are source-repository snapshots, not
package contents; they are excluded from the npm inventory. Their directory
is created only when an assessment is explicitly published.

## Schema version 2

Every source document has the following document-level shape:

```json
{
  "schemaVersion": 2,
  "component": "example",
  "lifecycle": "contract-reviewed",
  "conformance": "reviewed",
  "reviewedAt": "2026-09-01",
  "sources": [],
  "divergences": [],
  "requirements": []
}
```

`sources[]` is non-empty, sorted by source ID, and contains unique IDs.
Lifecycle, conformance, divergences, and requirements apply to the combined
local contract rather than to one upstream source.

When a contract has multiple sources, every requirement must list the sorted
source IDs that govern or support it:

```json
{
  "id": "EXM-001",
  "sources": ["fluent-v9", "x3-component"],
  "plannedEvidence": ["example.types.ts", "example.types.test.tsx"]
}
```

This resolves authority per requirement. It does not declare one source
globally authoritative for the whole component.

## Source kinds

Every source has an `id`, `kind`, and `authority`. Supported authorities are
`normative`, `behavior-reference`, `compatibility-reference`,
`implementation-evidence`, `platform-contract`, `token-reference`, and
`visual-evidence`.

### Pinned Flex/X3

A `flex-skill` entry records the exact skill payload and X3 lineage:

```json
{
  "id": "flex-component",
  "kind": "flex-skill",
  "authority": "normative",
  "skill": "flex-components:example",
  "sourceLock": "flex-...",
  "sourceLockFingerprint": "...",
  "availableSurfaces": ["shared", "web"],
  "surfacesConsulted": ["shared", "web"],
  "sourceFiles": [],
  "releaseDifferences": []
}
```

The repository's `flex-authoring` Agency profile pins `flex-components`,
`flex-system`, and `flex-tokens` to one self-consistent Marketplace commit.
`spec-source-lock.json` records that release and its immutable X3 source
lineage. Plugin versions are descriptive; commits, trees, files, and digests
define content identity.

`availableSurfaces` is generated from the source inventory.
`surfacesConsulted` is a review assertion and is never populated merely because
a surface exists. `releaseDifferences` records normalized-content differences
between the Marketplace authoring input and its X3 lineage; each difference
requires an explicit disposition before review.

### Versioned repository files

A `git-files` entry records a repository, full commit SHA, and sorted files:

```json
{
  "id": "fluent-v9",
  "kind": "git-files",
  "authority": "behavior-reference",
  "repository": "microsoft/fluentui",
  "commit": "0000000000000000000000000000000000000000",
  "files": [
    {
      "role": "implementation",
      "path": "packages/react-components/react-example/library/src/example.ts",
      "sha256": "..."
    }
  ]
}
```

Use this for Fluent v9 and other immutable repository evidence. The local
checker validates shape and identities; an explicit source review is
responsible for refreshing remote file digests.

### HTML and CSS artifacts

An `html-css` entry records an origin plus sorted HTML, CSS, computed-style,
accessibility-tree, or screenshot artifacts. Each artifact has a stable ID,
kind, location, and SHA-256 digest. Repository-relative artifacts are checked
against their recorded raw-byte digest. HTTPS artifacts retain an immutable
identity but require explicit source review because the credential-free checker
does not fetch them.

HTML/CSS can establish observable anatomy, content flow, computed values, and
captured browser behavior. It does not by itself establish native semantics,
state ownership, events, or platform accessibility.

### Visual references

A `visual-reference` entry uses `authority: visual-evidence` and records sorted
artifacts with stable IDs, locations, and raw-byte SHA-256 digests. Appearance,
state, platform, scale, viewport, and locale metadata may be recorded when
known.

Images can establish visible anatomy, geometry, typography, color, iconography,
and captured state differences. They cannot establish invisible semantics,
accessibility, events, keyboard behavior, motion, or controlled-state
ownership.

### Local foundations

A theme-aware foundation with no locked Flex catalog entry may use one
`local-foundation` source as its sole source:

```json
{
  "id": "local-foundation",
  "kind": "local-foundation",
  "authority": "normative",
  "references": [
    {
      "id": "react-native-api",
      "type": "external",
      "authority": "platform-contract",
      "location": "https://reactnative.dev/docs/0.81/example"
    }
  ]
}
```

References must be sorted and identify public platform contracts or repository
evidence. The checker rejects `local-foundation` for a component present in the
locked Flex catalog. It is not a way to bypass private source access.

## Composite evidence

Composite evidence is multiple source entries, not another source kind. Record
conflicts and uncertainty explicitly. Assign source IDs per requirement, and
use divergences or follow-up issues when evidence is contradictory,
unsupported, or incomplete.

New source evidence is a change proposal. It never rewrites a reviewed local
contract automatically.

## Contract lifecycle

| Lifecycle           | Conformance       | Evidence                                                                                          |
| ------------------- | ----------------- | ------------------------------------------------------------------------------------------------- |
| `contract-draft`    | `review-required` | Requirement IDs may name planned files.                                                           |
| `contract-reviewed` | `reviewed`        | The pre-code contract is approved; evidence may still be planned.                                 |
| `implemented`       | `reviewed`        | Every requirement names an existing type, implementation, test, story, or platform-evidence file. |

A changed source identity resets document conformance to `review-required` and
clears the review date until the affected requirements and divergences are
reviewed again.

## Authority

1. Immutable source identities establish exactly what evidence was consulted.
2. Source authority and requirement source IDs establish what each source may
   govern.
3. A reviewed local `SPEC.md` and its React Native companions define FURN
   behavior.
4. Public types, implementation, tests, stories, and platform evidence prove
   conformance to the local contract.

## Public content boundary

Commit source identifiers, paths, versions, dates, and digests. Commit source
artifacts only when redistribution is allowed. Write original documentation
for the public React Native API and behavior. Do not copy or lightly rewrite
private skill prose, rationale, tables, token files, or source bodies without
an explicit redistribution decision.

## Legacy staged specs

The former `specs/` files were source copies or adaptations used to stage
component work. They were removed under
[#4252](https://github.com/microsoft/fluentui-react-native/issues/4252): they
are not local React Native contracts and must not be maintained as a parallel
component catalog. The checker requires the legacy staging path to stay empty.

`spec-source-lock.json` keeps one `legacyStagedSpecs` record per removed
component, with its status, recorded feasibility, reason, re-evaluation
decision, and last-evaluated date. `legacySpecEvidence` pins the repository
commit and path template that contain the complete original blocker analysis.
The recorded outcomes are staging-time evidence, not a claim that a named
dependency is still absent; re-evaluate them against the current package before
drafting a contract. Components that still lack a local contract are listed in
[remaining work](remaining-work.md#components-without-a-local-contract).

Issue #4252 originally required commands that copied an upstream skill into
`specs/<name>` and later promoted that folder. Those criteria are intentionally
superseded: copying private source bodies into a public staging tree conflicts
with the public content boundary, and a mechanical web-to-native transform
reproduces the platform assumptions that created the recorded blockers. The
replacement is a pinned `flex-authoring` session plus a directly authored local
contract, which preserves reproducibility through immutable paths and digests
and reviewability through the contract lifecycle and requirement evidence.
Marketplace or X3 HEAD changes remain proposals. Primitives are governed by
their local `CONTRACT.md` files and are outside this migration.

## Validation and drift

Run the credential-free local check in any environment:

```sh
yarn workspace @fluentui-react-native/components check:spec-contracts
```

It validates schema version 2, local references and artifact digests,
requirement evidence, lifecycle, and review state. It does not claim that a
remote source is current.

With `GH_TOKEN` or `GITHUB_TOKEN` authorized for the curated Marketplace and X3
source, generate the Flex-only digest report:

```sh
yarn workspace @fluentui-react-native/components report:spec-source-drift --write
```

Use `--update-sources` during deliberate Flex release review to refresh the
nested `flex-skill` entry, optionally with `--component <name>`. Other source
entries and document-level contract fields are preserved. A changed Flex
identity clears the prior review; resolve release differences and review the
affected contract before restoring conformance.

Only `flex-skill` currently has automated release and candidate drift. Contract
entries without a Flex source report candidate status `not-applicable`.
`--offline --write` refreshes locally derived lifecycle and conformance fields
while preserving the last committed live Flex evidence.
