---
name: agentic-component-contract-authoring
description: Create or revise reviewed React Native component contracts in packages/agentic/components from Flex/X3, Fluent v9, HTML/CSS, images, local platform foundations, or composite evidence.
license: MIT
---

# Agentic component contract authoring

Turn source material into an original, reviewable Fluent UI React Native
contract. This skill owns source interpretation, authority, provenance,
uncertainty, React Native adaptation, divergences, and requirement planning. It
does not own component implementation.

Use this skill directly for contract-only, feasibility, or implementation-plan
requests. The [component authoring skill](../agentic-component-authoring/SKILL.md)
invokes this workflow before code when a contract is missing, stale, still a
draft, or accompanied by new source evidence.

## Choose the request mode

- **Feasibility or plan only:** inspect the evidence, identify blockers and
  unknowns, and describe the contract work without changing implementation.
  Commit contract files only when the user requested a contract.
- **Contract only:** create or revise the local contract and stop after its
  review state accurately reflects the evidence.
- **Contract plus implementation:** complete this workflow, then return to the
  component authoring skill without splitting the implementation into separate
  source-specific phases.

## Select source adapters

Load every adapter represented by the supplied evidence, but no others.

| Evidence                                      | Adapter                                                        |
| --------------------------------------------- | -------------------------------------------------------------- |
| Pinned Flex component skill and X3 lineage    | [Flex and X3](references/sources/flex-x3.md)                   |
| Fluent UI v9 source or specification          | [Fluent v9](references/sources/fluent-v9.md)                   |
| HTML, CSS, computed styles, or browser output | [HTML and CSS](references/sources/html-css.md)                 |
| Images, screenshots, or design renders        | [Visual reference](references/sources/visual-reference.md)     |
| Public native API plus repository precedent   | [Local foundation](references/sources/local-foundation.md)     |
| More than one of the preceding source sets    | [Composite evidence](references/sources/composite-evidence.md) |

## Workflow

1. Read the package instructions, the existing `SPEC.md`, all companions under
   `spec/`, and `SPEC-SOURCE.md`. Preserve a reviewed contract unless new
   evidence or an explicit requested behavior change requires re-review.
2. Inventory the source sets. Give each source a stable kebab-case ID, classify
   its authority, pin immutable identities where possible, and record only
   public or redistributable evidence.
3. Separate observations from inferences. A source governs only what it can
   establish: images do not prove semantics, CSS does not prove native
   interaction, and a web implementation does not define React Native
   platform behavior.
4. Resolve authority per requirement. For multiple sources, record sorted
   source IDs on every requirement and document conflicts explicitly; never
   choose one source as globally authoritative merely for convenience.
5. Draft the original React Native contract:
   - public API, slots, defaults, state ownership, and requirement IDs in
     `SPEC.md`;
   - FURN token bindings and gaps in `spec/tokens.yaml`;
   - native accessibility in `spec/accessibility.md`;
   - keyboard, pointer, focus, and motion behavior in
     `spec/interaction.md`;
   - FURN examples and constraints in `spec/usage.md`;
   - lifecycle, provenance, divergences, and requirement evidence in
     `spec/source.json`.
6. Classify every relevant source claim as adopted, adapted, intentionally
   divergent, not applicable, deferred, or unknown. Do not turn missing
   evidence into an inferred guarantee.
7. Review the contract before code. Keep `contract-draft`,
   `review-required`, and a null review date until the source interpretation,
   native adaptation, authority decisions, and planned evidence are coherent.
   Move to `contract-reviewed` only after that explicit review.
8. Run the package contract checker. Source refresh tools may update provenance
   but never approve a contract or populate reviewed surfaces automatically.

## Contract rules

- `spec/source.json` uses schema version 2 and a sorted, non-empty `sources[]`.
  Source IDs are unique. Keep this generated, digest-heavy metadata in JSON;
  `spec/tokens.yaml` remains YAML because token mappings are human-authored.
- Supported source kinds are `flex-skill`, `git-files`, `html-css`,
  `visual-reference`, and `local-foundation`.
- A source's `authority` describes how it may govern requirements. Requirement
  `sources` identify the actual source set used for that decision.
- `git-files` records a repository, full commit SHA, and sorted file paths with
  SHA-256 digests. `html-css` and `visual-reference` record immutable artifact
  digests; repository-relative artifacts are verified locally.
- A `local-foundation` source is valid only when no Flex catalog component
  exists and must be the contract's sole source.
- Only `flex-skill` has automated release and candidate drift reporting.
  Other immutable sources report Flex drift as `not-applicable`; refresh their
  identities through an explicit source review.
- A reviewed local contract is normative for FURN. New upstream evidence is a
  change proposal, not an automatic rewrite.
- Do not copy or lightly transform private source bodies into this public
  repository. Record identities and write original React Native documentation.
