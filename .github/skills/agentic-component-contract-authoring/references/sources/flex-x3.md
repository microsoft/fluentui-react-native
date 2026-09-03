# Flex and X3 source adapter

Use this adapter for a component in the pinned Flex catalog. Flex skills are
authoring inputs; the immutable X3 lineage identifies their original design
source, and the reviewed local contract defines FURN behavior.

## Resolve the source

Start Agency with the repository's `flex-authoring` profile and invoke
`flex-components:<name>`. Confirm that the profile and
`packages/agentic/components/spec-source-lock.json` identify the same release.
Read shared and usage material plus the relevant platform companions. Do not
combine files from different releases or use one platform as an implicit
fallback for another.

Generate or refresh the `flex-skill` entry with:

```sh
yarn workspace @fluentui-react-native/components report:spec-source-drift --write --update-sources --component <name>
```

The entry records `authority: normative`, the skill ID, source-lock identity,
available and consulted surfaces, immutable Marketplace/X3 file identities,
and release differences. Availability is generated; consultation is a
reviewer's assertion and remains empty after a source identity changes.

## Adapt to React Native

Classify source guidance as adopted, adapted, intentionally divergent, not
applicable, or deferred. Consult the Flex token map and the closest Win32,
macOS, or Windows FURN implementation for compatibility; do not use iOS as the
cross-platform canonical reference unless the work targets iOS.

Translate web concepts deliberately:

| Flex evidence                        | React Native contract                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| ARIA attributes or native elements   | ARIA-aligned `role`, `accessibilityState`, labels, and UIA/AX expectations         |
| CSS pseudo-classes                   | explicit interaction state and precedence                                          |
| browser focus selectors and outlines | persistent `FocusVisual`; never conditional `outline*` or RNW native focus visuals |
| CSS pixel or layout rules            | React Native units, minimum targets, and platform behavior                         |
| unsupported browser capability       | explicit divergence, dependency, or blocker                                        |

Do not copy Flex prose or token tables into the public package. A mutable
Marketplace or X3 HEAD change is candidate drift and does not invalidate a
contract ratified against the pinned release.
