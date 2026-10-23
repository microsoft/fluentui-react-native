---
name: agentic-component-contract-authoring
description: Create or revise reviewed React Native component contracts in packages/agentic/components from Flex/X3, Fluent v9, HTML/CSS, images, local platform foundations, or composite evidence. Use for contract-only or contract-feasibility work, and as the contract gate before implementing or planning a component change.
license: MIT
---

# Agentic component contract authoring

Turn source material into an original, reviewable Fluent UI React Native
contract. This skill owns source interpretation, authority, provenance,
uncertainty, React Native adaptation, divergences, and requirement planning. It
does not own component implementation.

Use this skill directly for contract-only or contract-feasibility requests. A
plan to change a component's implementation or public API starts in the
[component authoring skill](../agentic-component-authoring/SKILL.md), which
invokes this workflow before code when a contract is missing, stale, still a
draft, or accompanied by new source evidence.

## Choose the request mode

- **Feasibility or contract plan:** inspect the evidence, identify blockers and
  unknowns, and describe the contract work without changing implementation.
  Commit contract files only when the user requested a contract.
- **Contract only:** create or revise the local contract and stop after its
  review state accurately reflects the evidence.
- **Contract plus implementation:** complete this workflow, then return to the
  component authoring skill without splitting the implementation into separate
  source-specific phases.

## Select source adapters

Load every adapter represented by the supplied evidence, but no others.

| Evidence                                      | Adapter                                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Pinned Flex component skill and X3 lineage    | [Flex and X3](../../../packages/agentic/components/references/contract-sources/flex-x3.md)                   |
| Fluent UI v9 source or specification          | [Fluent v9](../../../packages/agentic/components/references/contract-sources/fluent-v9.md)                   |
| HTML, CSS, computed styles, or browser output | [HTML and CSS](../../../packages/agentic/components/references/contract-sources/html-css.md)                 |
| Images, screenshots, or design renders        | [Visual reference](../../../packages/agentic/components/references/contract-sources/visual-reference.md)     |
| Public native API plus repository precedent   | [Local foundation](../../../packages/agentic/components/references/contract-sources/local-foundation.md)     |
| More than one of the preceding source sets    | [Composite evidence](../../../packages/agentic/components/references/contract-sources/composite-evidence.md) |

## Workflow

1. Read the [package instructions](../../../packages/agentic/components/AGENTS.md), the existing `SPEC.md`, all
   companions under `spec/`, and the [contracts reference](../../../packages/agentic/components/references/contracts.md).
   Preserve a reviewed contract unless new evidence or an explicit requested behavior change requires re-review.
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
   - FURN token bindings and gaps in `spec/tokens.yaml`, mapped through the
     canonical Flex token map described in the [design tokens reference](../../../packages/agentic/design/references/tokens.md).
     Name each proposed binding or list it as unresolved;
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
8. Run the package contract checker described in
   [validation and drift](../../../packages/agentic/components/references/contracts.md#validation-and-drift). Source
   refresh tools may update provenance but never approve a contract or populate reviewed surfaces automatically.

## Contract rules

The [contracts reference](../../../packages/agentic/components/references/contracts.md) owns the `spec/source.json`
schema, source kinds and authorities, lifecycle and review state, the public content boundary, and the validation and
drift commands. Apply it rather than restating it here. In particular:

- A reviewed local contract is normative for FURN. New upstream evidence is a change proposal, not an automatic
  rewrite.
- A `local-foundation` source is valid only when no Flex catalog component exists, and it must be the sole source.
- Record identities and write original React Native documentation; never copy or lightly transform private source
  bodies into this public repository (R-REPO-004).
