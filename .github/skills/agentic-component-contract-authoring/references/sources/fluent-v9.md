# Fluent v9 source adapter

Use Fluent UI v9 as API, behavior, and design precedent, not as a DOM contract
for React Native.

## Record provenance

Pin the exact repository and full commit SHA. Record a `git-files` source with
sorted source/spec paths, semantic roles, and SHA-256 digests. Use an authority
such as `behavior-reference`, `compatibility-reference`, `token-reference`, or
`implementation-evidence` that describes what the selected files can govern.
Do not cite a mutable branch or package version without its immutable commit.

## Interpret the source

Inspect public types, state hooks, render structure, styles, tests, stories, and
published specifications as separate evidence surfaces. Distinguish intended
public behavior from incidental implementation details.

- Preserve portable API names and state ownership when they fit native usage.
- Translate DOM elements and ARIA to React Native roles, states, labels, and
  platform accessibility expectations.
- Translate CSS inheritance, selectors, and pseudo-classes into explicit
  tokens, state precedence, and native layout.
- Treat browser focus, keyboard, pointer, and hover behavior as evidence to
  adapt, not behavior to copy mechanically.
- Record unsupported or intentionally different behavior as a divergence.

When Fluent v9 is combined with another design source, assign its source ID
only to the requirements for which it is authoritative or informative.
