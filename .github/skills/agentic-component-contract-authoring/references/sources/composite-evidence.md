# Composite evidence adapter

Use multiple `sources[]` entries when no single source can establish the full
React Native contract. Composite evidence is a resolution method, not a source
kind.

## Resolve authority per requirement

For every requirement, list the sorted source IDs that govern or support it.
Do not assign one global precedence order to an entire component. A common
division is:

| Requirement area         | Likely authority                                     |
| ------------------------ | ---------------------------------------------------- |
| design intent and tokens | normative design source plus token reference         |
| public API and state     | product specification or reviewed behavior reference |
| native semantics         | React Native/platform contract                       |
| visual fidelity          | normative design source plus visual evidence         |
| compatibility            | existing FURN implementation                         |

One source may be authoritative for one requirement and merely corroborating
for another. If sources disagree, record the conflicting claims, chosen
resolution, rationale, and divergence or follow-up issue. If evidence is
insufficient, keep the behavior unknown or deferred.

## Keep the contract reviewable

- Give each source a stable ID and use the source-specific adapter schema.
- Keep `sources[]` sorted and unique.
- Require every requirement to identify at least one source when more than one
  source is present.
- Do not duplicate one artifact across source entries to manufacture
  corroboration.
- Re-review only the requirements affected by changed evidence, but keep the
  document-level conformance state at `review-required` until the combined
  contract is coherent again.
