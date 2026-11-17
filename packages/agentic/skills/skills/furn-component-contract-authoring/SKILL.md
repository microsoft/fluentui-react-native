---
name: furn-component-contract-authoring
description: Create or revise reviewed Fluent UI React Native component contracts from Flex/X3, Fluent v9, HTML/CSS, images, local platform foundations, or composite evidence. Use for contract-only or feasibility work and the contract gate before implementation. Does not implement components.
license: MIT
---

# FURN component contract authoring

Read [consumer context](../../references/shared/portable/context.md) first.
Write an original React Native contract from evidence, not a mechanical
translation of web or private source. This workflow can draft a contract
before runtime packages are installed; exact package schemas and tooling
require the corresponding installed package or its authorized source checkout.

## Mode and evidence

- **Feasibility/plan:** inspect evidence and identify blockers read-only.
  Do not create files unless a contract was requested.
- **Contract only:** create or revise the contract, review its state honestly,
  and stop without implementing.
- **Contract plus implementation:** complete the review gate, then return to
  [component authoring](../furn-component-authoring/SKILL.md).

Select only the source adapters represented by the evidence. When using the
FURN contract schema, resolve
`@fluentui-react-native/components/references/contracts.md` and these
package-relative adapters:

| Evidence                 | Path beneath the components package                                                   |
| ------------------------ | ------------------------------------------------------------------------------------- |
| Pinned Flex/X3           | `@fluentui-react-native/components/references/contract-sources/flex-x3.md`            |
| Fluent v9                | `@fluentui-react-native/components/references/contract-sources/fluent-v9.md`          |
| HTML/CSS/browser output  | `@fluentui-react-native/components/references/contract-sources/html-css.md`           |
| Images or renders        | `@fluentui-react-native/components/references/contract-sources/visual-reference.md`   |
| Public native foundation | `@fluentui-react-native/components/references/contract-sources/local-foundation.md`   |
| Multiple source sets     | `@fluentui-react-native/components/references/contract-sources/composite-evidence.md` |

## Workflow

1. Read the target's instructions and any existing reviewed contract,
   provenance, and companions. Preserve unchanged reviewed requirements.
2. Inventory sources, assign stable IDs, state each source's authority, and
   pin immutable revisions/digests where possible. Record only evidence
   whose use and redistribution are authorized.
3. Separate observations, inferences, and unknowns. Images establish visible
   appearance, not accessibility or events. CSS and web behavior do not
   establish native-platform behavior.
4. Resolve authority per requirement. With composite evidence, record the
   contributing source IDs and explicit conflict dispositions, not a single
   convenient globally authoritative source.
5. Draft public API, slots, defaults, state ownership, requirement IDs,
   tokens, [accessibility](../../references/shared/portable/accessibility.md),
   interaction/focus/motion, usage, provenance, divergences, and planned
   evidence. Identify unresolved token bindings rather than guessing.
6. For the FURN schema, use `SPEC.md` and the `spec/tokens.yaml`,
   `spec/accessibility.md`, `spec/interaction.md`, `spec/usage.md`, and
   `spec/source.json` companions as defined by the owning contracts
   reference. Do not invent a competing schema. Other hosts explicitly
   choose their own contract format.
7. Classify source claims as adopted, adapted, intentionally divergent, not
   applicable, deferred, or unknown. A local-foundation contract must not
   bypass an existing Flex catalog source; in the FURN schema it is the sole
   source and is validated by the owning checker.
8. Keep draft/review-required status and no review date until source
   interpretation, native adaptation, authority, and evidence are explicitly
   reviewed. Only that review permits a reviewed contract.
9. Run the target's declared contract validator when available. Run FURN's
   source-refresh/checker commands only in its owning source workspace;
   never infer approval from a successful refresh or an installed dependency.

The owning package reference defines exact schema, lifecycle, content
boundaries, validation, and drift behavior. Record identities and write
original documentation; never copy or lightly transform private source
bodies into public output. Upstream changes are proposals, not automatic
rewrites of a reviewed local contract.
