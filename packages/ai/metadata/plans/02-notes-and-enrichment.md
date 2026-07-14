---
title: Metadata — Notes and Enrichment Pipeline
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

# Notes and Enrichment Pipeline

## Context

Add the human/agent-authored note layer so generated metadata includes interpretation and migration guidance beyond raw analyzer output.

## Deliverables

### 1. Notes source model

Define a file format for component notes (JSON or YAML) with:

- component key
- optional per-state notes
- design intent / usage caveats
- migration hints toward web-aligned styling model
- provenance (`author`, `updatedAt`, optional links)

### 2. Notes loader + merge strategy

Implement:

- load notes from a deterministic directory (for example `packages/ai/metadata/notes/`)
- merge strategy that overlays notes onto generated component records without mutating analyzer-derived data
- explicit conflict semantics (reject duplicate entries for same component/state)

### 3. Instruction template for note generation

Add agent-facing prompt templates under `src/instructions/` for producing structured notes from component source + generated metadata.

Template requirements:

- strict output schema
- concise, factual language
- no inferred behavior without evidence from metadata/source

### 4. Validation and linting rules for notes

Implement checks for:

- unknown component keys
- unknown state ids
- empty/whitespace notes
- stale references (optional warning level)

### 5. Tests

- loader and merge behavior tests
- duplicate/invalid note detection tests
- integration test: generated component + notes => enriched output includes both machine and human sections

## Done when

- [ ] Notes can be authored independently and merged deterministically.
- [ ] Invalid notes fail validation with actionable diagnostics.
- [ ] Enriched metadata records preserve raw analyzer data plus notes/provenance.
- [ ] Tests cover merge, conflict, and validation flows.

## Out of scope

- Analyzer orchestration itself.
- CI task graph wiring.
