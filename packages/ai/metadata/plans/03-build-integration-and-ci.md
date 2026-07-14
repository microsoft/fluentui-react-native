---
title: Metadata — Build Integration and CI Enforcement
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

# Build Integration and CI Enforcement

## Context

Wire metadata generation into repository workflows so artifacts stay current and drift is caught quickly.

## Deliverables

### 1. Package scripts + command UX

Finalize package scripts:

- `build` (compile package)
- `metadata:generate` (runs generation command)
- `metadata:validate` (schema + consistency checks)
- `metadata:check` (fails if regeneration changes tracked artifacts)

### 2. Lage integration

- Add/extend Lage tasks so metadata generation can run in CI and locally.
- Ensure dependencies are ordered so analyzer build/test preconditions are respected.
- Keep metadata checks scoped to relevant workspaces where possible.

### 3. Artifact location and source control policy

Define and document:

- where generated metadata is written
- which files are checked into source control
- which files are ephemeral/cache-only

### 4. Drift detection

Implement a check mode:

1. run generation
2. compare with committed artifacts
3. fail with concise diff guidance if artifacts changed

### 5. CI/dev ergonomics

- Add clear failure messaging with exact remediation command(s).
- Ensure local command parity with CI command.
- Keep runtime reasonable by supporting component filters/shards.

### 6. Tests

- script-level tests for check mode behavior
- integration test that simulates stale checked-in metadata and verifies failure

## Done when

- [ ] Metadata generation/validation are first-class scripted tasks.
- [ ] CI can fail on stale metadata deterministically.
- [ ] Developers have one command to regenerate artifacts and resolve failures.
- [ ] Lage graph includes metadata checks in the appropriate path.

## Out of scope

- New metadata schema fields.
- Web styling transformation logic.
