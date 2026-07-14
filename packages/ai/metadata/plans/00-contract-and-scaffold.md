---
title: Metadata — Contract, Schema, and Package Scaffold
status: ready
parallelizable: false
blocks: [01-extraction-engine, 02-notes-and-enrichment, 03-build-integration-and-ci, 04-web-styling-bridge]
permissions:
  allow:
    - "Bash(yarn:*)"
    - "Bash(npm:*)"
    - "Bash(npx:*)"
    - "Bash(node:*)"
    - "Bash(tsgo:*)"
    - "Bash(tsc:*)"
    - "Bash(jest:*)"
    - "Bash(eslint:*)"
    - "Bash(lage:*)"
    - "Bash(ls:*)"
    - "Bash(find:*)"
    - "Bash(grep:*)"
    - "Bash(rg:*)"
    - "Bash(cat:*)"
    - "Bash(head:*)"
    - "Bash(tail:*)"
    - "Bash(wc:*)"
    - "Bash(mkdir:*)"
    - "Bash(cp:*)"
    - "Bash(mv:*)"
    - "Bash(touch:*)"
    - "Bash(git status)"
    - "Bash(git diff:*)"
    - "Bash(git log:*)"
    - "Bash(git show:*)"
---

# Contract, Schema, and Scaffold

## Context

Create the initial `@fluentui-react-native/metadata` package structure and the canonical metadata contract used by all downstream workstreams.

`@fluentui-react-native/analyzer` already exists and provides token mapping, a11y extraction, and component matrix APIs. This brief defines the storage and orchestration contract that consumes analyzer outputs.

## Deliverables

### 1. Package scaffold

- Create `packages/ai/metadata/package.json` following workspace conventions.
- Add `src/` with initial module layout:
  - `src/index.ts`
  - `src/contracts/metadata.ts`
  - `src/contracts/schema.ts`
  - `src/generate/index.ts`
  - `src/validate/index.ts`
  - `src/io/index.ts`
  - `src/componentCatalog/index.ts`
- Add `tsconfig.json`, `jest.config.cjs`, and scripts aligned to repo patterns (`build`, `lint`, `test`).

### 2. Canonical metadata contract (`src/contracts/metadata.ts`)

Define versioned interfaces for persisted JSON:

- `MetadataEnvelope` with:
  - `schemaVersion`
  - `generatedAt`
  - `generator` (name/version)
  - `components: ComponentMetadataRecord[]`
- `ComponentMetadataRecord` with:
  - component identity (`name`, `packageName`, `exportName`, `platform?`)
  - state metadata list (`id`, `props`, interaction summary)
  - token mapping payload (slot + property + token path/value)
  - a11y payload (serialized tree + issues)
  - notes payload (human notes + provenance)
  - extraction status/errors

Use extensible sub-objects and avoid flattening everything into a single object.

### 3. JSON schema + validator bridge

- Create a JSON schema representation for the persisted artifact.
- Add runtime validation helpers for:
  - full-envelope validation
  - per-component validation
  - version mismatch detection with actionable errors

### 4. Component catalog contract

- Define a deterministic `ComponentCatalogEntry` shape.
- Implement a catalog provider stub that returns a stable ordered list.
- Include explicit support for allowlist/denylist and per-component override file paths.

### 5. Command surface contract

Define API + CLI command intent (implementation can be placeholder stubs):

- `metadata generate`
- `metadata validate`
- `metadata list-components`

The exact command names must be stable after this brief; downstream briefs depend on them.

## Done when

- [ ] Package scaffolding is in place and builds.
- [ ] Versioned metadata TypeScript contracts are checked in.
- [ ] JSON-schema-backed validation exists for artifact and component records.
- [ ] Component catalog contract and deterministic ordering behavior are defined.
- [ ] Command surface is defined and exported for downstream implementation.

## Out of scope

- Real analyzer invocation and metadata extraction logic.
- Notes ingestion pipeline implementation.
- CI/build wiring.
