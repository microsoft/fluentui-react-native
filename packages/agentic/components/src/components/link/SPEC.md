---
name: link
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Link

## Scope

A navigation target in standalone or flowing text. An action that does not navigate is a Button. A link does not
track a browser history database, create tabs, or promise a desktop context menu.

## Public contract

| Proposed prop             | Default              | Purpose                                                                                                                                     |
| ------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `content`                 | required             | Meaningful text naming the destination; allow localized native text to wrap.                                                                |
| `url or onNavigate`       | exactly one          | Either dispatch the URL through the platform or let the application handle routing. Never dispatch both.                                    |
| `inline / typography`     | false / `functional` | Standalone or nested in a text run; choose functional or content typography. Inline inherits the surrounding line metrics.                  |
| `disabled / trailingIcon` | false / absent       | Disabled prevents navigation. An optional external-destination cue is decorative unless separately communicated in the name or description. |

### Slots and ownership

The root/ref is the native Text target (including the inline form), not a separate View inserted in a paragraph.
The label and optional icon make one link. Keep standalone focus geometry separate from inline text layout.

Related contracts used by this design: [Text](../text/SPEC.md).

### Data and callbacks

The proposed destination union is `{ url: string; onNavigate?: never } | { url?: never; onNavigate: () => void
}`. A link only uses the native URL dispatch for the first shape. Content typography can request a native
plain/dotted underline where supported; a plain visible underline is preferable to losing a link cue. No locally
stored visited-history API is proposed.

### Requirements

- **LNK-001:** Reject ambiguous destinations and empty names; do not expose browser target, download or visited-history APIs.
- **LNK-002:** Navigate on completed press, Enter or native link invocation exactly once. Do not install synthetic Space activation.
- **LNK-003:** Keep inline links distinguishable without color alone, including high contrast. A visited link need not change its resting color.
- **LNK-004:** Require an independently named and invokable inline target before claiming inline support. A container-level role does not identify a link inside a sentence.

## Platform behavior

The existing V1 Windows handler also accepts Space; this draft intentionally prefers link semantics. Native
inline focus, range geometry and hit testing are separate from a standalone link. Do not use a whole paragraph's
rect as its inline focus boundary.

## Divergences from Flex

- `native-link-activation` — **accepted.** Enter or native invocation performs navigation; there is no extra Space action or implicit browser affordance.
- `inline-target-proof` — **deferred.** Qualify independent text-range focus and activation on each renderer; otherwise use a standalone link.

## Conformance

Activate adjacent links by keyboard, pointer and native assistive action; assert one route change each, no
change on Space or disable, and correct wrap/underline in RTL.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
