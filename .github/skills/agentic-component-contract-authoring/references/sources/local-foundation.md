# Local foundation source adapter

Use `local-foundation` only for a theme-aware foundational component that has
no entry in the locked Flex component catalog. This is not a bypass for missing
Flex access or an alternative way to author a catalog component.

The source entry is the contract's sole source and uses
`authority: normative`. Its sorted references identify the public native
platform contract and repository precedents used during review. Give each
reference its own authority, such as `platform-contract`,
`compatibility-reference`, or `token-reference`.

Inspect the current React Native API for the package's supported version,
relevant native behavior, existing FURN components, and token mappings. Define
the smallest theme-aware primitive contract needed by other components. Keep
web inheritance or browser behavior out of the contract unless React Native
provides an equivalent.

Local-foundation contracts still require lifecycle, review, divergence,
requirement, implementation, test, story, and platform evidence. Flex release
and candidate drift are `not-applicable`. The checker rejects this source kind
if the locked Flex catalog contains the component.
