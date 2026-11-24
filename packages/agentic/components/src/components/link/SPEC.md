---
name: link
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Link

## Scope

A standalone navigation target. An action that does not navigate is a Button. A link does not track browser history,
create tabs, or promise a desktop context menu. Links inside flowing text are not part of this public API.

## Public contract

| Proposed prop             | Default        | Purpose                                                                                                                                     |
| ------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `content`                 | required       | Meaningful text naming the destination; allow localized native text to wrap.                                                                |
| `url or onNavigate`       | exactly one    | Either dispatch the URL through the platform or let the application handle routing. Never dispatch both.                                    |
| `typography`              | `functional`   | Functional or content typography.                                                                                                           |
| `disabled / trailingIcon` | false / absent | Disabled prevents navigation. An optional external-destination cue is decorative unless separately communicated in the name or description. |

### Slots and ownership

The root/ref is one link-role native Pressable View, hosting a wrapping Text label and optional decorative icon.
This keeps hover, focus, and invocation on one native owner; macOS Text does not expose the same interaction
surface. Do not insert this root inside a paragraph. Root style and tooltip forward to the root once.

Related contracts used by this design: [Text](../text/SPEC.md).

### Data and callbacks

The proposed destination union is `{ url: string; onNavigate?: never } | { url?: never; onNavigate: () => void
}`. A link only uses native URL dispatch for the first shape. A visible native underline provides a non-color cue
in both typography variants. Exact dotted geometry is not promised. No visited-history API is exposed.

### Requirements

- **LNK-001:** Reject ambiguous destinations and empty names; do not expose browser target, download or visited-history APIs.
- **LNK-002:** Navigate on completed press, Enter or native link invocation exactly once. Do not install synthetic Space activation.
- **LNK-003:** Keep links distinguishable without color alone, including high contrast. A visited link need not change its resting color.
- **LNK-004:** Require an independently named and invokable inline target before claiming inline support. A container-level role does not identify a link inside a sentence.

## Platform behavior

The existing V1 Windows handler also accepts Space; this contract intentionally prefers link semantics. Native
inline focus, range geometry and hit testing are separate from a standalone link. Do not use a whole paragraph's
rect as its inline focus boundary.

## Divergences from Flex

- `native-link-activation` — **accepted.** Enter or native invocation performs navigation; there is no extra Space action or implicit browser affordance.
- `inline-target-proof` — **deferred.** Qualify independent text-range focus and activation on each renderer; otherwise use a standalone link.

## Conformance

Activate standalone links by keyboard, pointer and native assistive action; assert one route change each, no
change on Space or disable, and correct wrap/underline in RTL. Do not treat standalone keyboard focus as inline proof.

The [requirement evidence](spec/source.json) distinguishes standalone implementation and outstanding native proof.

See the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md).
