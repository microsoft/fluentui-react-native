---
title: Metadata — Extraction Engine (Analyzer Orchestration)
status: ready
parallelizable: true
blockedBy: [00-contract-and-scaffold]
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

# Extraction Engine (Analyzer Orchestration)

## Context

Implement the core generation pipeline that invokes `@fluentui-react-native/analyzer` for each cataloged component/state and emits typed metadata records conforming to the contract from `00`.

## Deliverables

### 1. Generator core (`src/generate/`)

Implement:

- `generateMetadata(options): Promise<MetadataEnvelope>`
- `generateComponentMetadata(entry, options): Promise<ComponentMetadataRecord>`

Pipeline per component:

1. Resolve component module/export from catalog entry.
2. Resolve `ComponentMetadata` state spec (base defaults + component-specific metadata source).
3. Run analyzer matrix (`runComponentMatrix` / `analyzeComponent`).
4. Collect:
   - token map from theme pipeline
   - a11y tree + issues
   - per-state status/errors
5. Emit deterministic record.

### 2. Deterministic generation

- Stable component order (catalog order).
- Stable state order (metadata order).
- Stable object key order in persisted JSON.
- Configurable timestamp mode:
  - real timestamp (default)
  - fixed timestamp for tests/CI determinism checks.

### 3. Failure model

- Per-component failures must be captured in that component record.
- Generation should continue after non-fatal component failures.
- Fatal setup errors (bad config, unreadable catalog, schema mismatch) should fail the command.

### 4. Output writing

- Implement output writer to persist:
  - aggregate artifact (`metadata.json`)
  - optional per-component shards (`components/<name>.json`) for diffability
- Include content hashing to skip unnecessary writes when unchanged.

### 5. Tests

- Unit tests for deterministic sort/order behavior.
- Unit tests for partial-failure continuation.
- Integration test with a small catalog (e.g., Button + one toy component) validating non-empty token/a11y payloads.
- Snapshot tests for persisted JSON shape.

## Done when

- [ ] `metadata generate` produces contract-valid artifacts from real analyzer calls.
- [ ] Partial failures are reported per component without aborting the full run.
- [ ] Repeated generation with fixed timestamp is byte-for-byte identical.
- [ ] Tests cover happy path + failure path + determinism.

## Out of scope

- Notes authoring workflow and override schema.
- Build/CI command registration.
