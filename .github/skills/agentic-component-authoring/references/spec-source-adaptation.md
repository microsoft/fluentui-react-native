# Flex source adaptation

Use this reference when creating or revising a higher-order component contract.
Flex skills provide design evidence; local React Native documents define FURN
behavior.

## Resolve one immutable source set

Start Agency with the repository's `flex-authoring` profile and invoke
`flex-components:<name>`. Confirm that `flex-components`, `flex-system`, and
`flex-tokens` resolve to the release in
`packages/agentic/components/spec-source-lock.json`.

Read the component's shared skill and usage material plus its web companions.
Read mobile companions only when that component provides them. A platform never
falls back to another platform's files, and files from different revisions must
not be combined.

Do not copy source prose or token tables into the public repository. Record
only identifiers and digests in `spec/source.json`.

## Draft the React Native contract

Before implementation, classify every relevant axis, slot, behavior, and token
along two dimensions:

1. Source surface: shared, web, mobile, Flex system, or an existing FURN
   implementation.
2. Disposition: adopted, adapted, intentional divergence, not applicable, or
   deferred.

Consult the local Flex token map and the closest Win32, macOS, or Windows V1
implementation. Do not use iOS as the desktop compatibility reference.

Write an original local contract:

- public props, slots, defaults, and state ownership in `SPEC.md`;
- actual FURN token bindings in `spec/tokens.yaml`;
- React Native accessibility and UIA/AX behavior in
  `spec/accessibility.md`;
- keyboard, pointer, focus, and motion behavior in `spec/interaction.md`;
- FURN usage and examples in `spec/usage.md`.

Give contract requirements stable IDs and map each one to existing or planned
types, tests, stories, or platform evidence in the Conformance table. Record
every divergence in `SPEC.md` with a stable ID, disposition, rationale, status,
and issue when follow-up work is required.

Translate platform concepts deliberately:

| Flex evidence                        | React Native contract                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| ARIA attributes or native elements   | `accessibilityRole`, `accessibilityState`, labels, and UIA/AX expectations         |
| CSS pseudo-classes                   | explicit interaction state and precedence                                          |
| browser focus selectors and outlines | persistent `FocusVisual`; never conditional `outline*` or native RNW focus visuals |
| CSS pixel or layout rules            | React Native layout units, minimum targets, and platform behavior                  |
| unsupported browser capability       | explicit divergence, dependency, or blocker                                        |

Review the draft contract before writing code.

Use `contract-draft` with `review-required` while authoring. A pre-code review
moves the lifecycle to `contract-reviewed`, records only the source surfaces
the reviewer actually consulted, and adds the review date. Planned evidence
paths may remain unrealized at this stage.

## Implement and ratify

Implement the component through the normal types, state, styles, render, and
assembly stages. Derive tests and stories from the requirement IDs. After
validation, reconcile the draft against the realized public types and native
output. Change the contract only through an explicit review; do not make an
accidental implementation choice authoritative after the fact.

Generating or repinning `spec/source.json` requires access to the private
Marketplace and x3 repositories. Set lifecycle to `implemented` and
conformance to `reviewed` only when the contract, implementation, and declared
evidence agree. Updating
the immutable source lock or its recorded file identities clears that review
until each delta is adopted, adapted, rejected, or deferred. Drift at mutable
Marketplace or x3 HEAD is a candidate proposal and does not invalidate a
contract ratified against the pinned release.
