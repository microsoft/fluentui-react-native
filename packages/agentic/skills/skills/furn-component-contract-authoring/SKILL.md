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
   whose use and redistribution are authorized. Distinguish the source
   surfaces actually consulted from those merely available.
3. Separate observations, inferences, and unknowns. Images establish visible
   appearance, not accessibility or events. CSS and web behavior do not
   establish native-platform behavior.
4. Resolve authority per requirement. With composite evidence, record the
   contributing source IDs and explicit conflict dispositions, not a single
   convenient globally authoritative source.
5. Draft public API, slots, defaults, state ownership, requirement IDs,
   tokens, [accessibility](../../references/shared/portable/accessibility.md),
   interaction/focus/motion, usage, provenance, divergences, and planned
   evidence. For each changed requirement, capture the proposed native
   behavior, what would verify it, and any unresolved token or platform
   capability. Record blockers or deferrals rather than guessing.
6. For the FURN schema, use `SPEC.md` and its `spec/` companions as defined
   by the owning contracts reference for the target package version. Follow
   the single token companion named by `tokens:` in an existing `SPEC.md`;
   preserve its format unless an explicit migration is in scope. If an
   installed package omits the existing contract, consult matching authorized
   source or report what is missing rather than guessing. For a new contract,
   use the owning reference's format guidance. Other hosts choose their own
   contract format.
7. Classify source claims as adopted, adapted, intentionally divergent, not
   applicable, deferred, or unknown. A local-foundation contract must not
   bypass an existing Flex catalog source; in the FURN schema it is the sole
   source and is validated by the owning checker.
8. Keep draft/review-required status and no review date until source
   interpretation, native adaptation, authority, and evidence are explicitly
   reviewed. Carry the reviewed requirement IDs, planned evidence, and open
   blockers into the implementation handoff. A reviewed contract does not
   establish native qualification or release readiness.
9. Run the target's declared contract validator when available. Run FURN's
   source-refresh/checker commands only in its owning source workspace;
   never infer approval from a successful refresh or an installed dependency.

The owning package reference defines exact schema, lifecycle, content
boundaries, validation, and drift behavior. Record identities and write
original documentation; never copy or lightly transform private source
bodies into public output. Candidate drift does not change the pinned
contract. Changing the source identity used by the contract requires renewed
review, not an automatic rewrite.
