---
name: label
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Label

## Scope

Label supplies the visible name of a form control or related group. Its text, the native
name relationship, and the result of clicking the label are three distinct things. A
label can name a group without acting on any group member. Use Text, not Label, for prose.

## Public contract

| Proposed prop          | Default             | Meaning                                                                                                        |
| ---------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| `content: string`      | required            | Nonblank, localized visible name; never inferred from a placeholder.                                           |
| `labelID?: string`     | absent              | Native identity of the **visible text** for consumers binding by relationship; not the root view's `nativeID`. |
| `target?: LabelTarget` | absent              | Optional explicit delegation for a label click; it does not establish an accessible name by itself.            |
| `size`, `weight`       | `medium`, `regular` | `small \| medium \| large` and `regular \| strong`; weight changes typography, not behavior.                   |
| `required`, `disabled` | `false`, `false`    | Show the required marker and mute a standalone disabled label, respectively. Disabled also refuses delegation. |

`LabelTarget` is a proposed discriminated union:
`{ kind: 'editor'; focus: () => void } | { kind: 'choice'; activate: () => void } | { kind: 'group' }`.
Supply an owner operation, not a synthetic native event. The owner resolves the currently mounted, enabled
control when called. Only a group name is shared; individual options keep their own names.

The `root` slot is a structural `View`; `ref` is its native React 19 ref, never the control ref.
Root style and `tooltip?: string` apply to that view once. The text and optional trailing marker
are private. The text can wrap at system text sizes. The marker shares its baseline and typography
but is not part of the control's name. The internal `muted` token axis reflects standalone disabled
presentation; [Field](../field/SPEC.md) keeps its label readable without enabling its target.
Label does not own hover, pressed or focus visuals.

### Requirements

- **LBL-001:** Require meaningful content and keep the root, visible-text identity and control target distinct.
- **LBL-002:** Resolve typography, marker spacing and standalone disabled colors through the token companion.
  Preserve required appearance when disabled and do not add an empty marker slot.
- **LBL-003:** Prefer a native labeling relationship on a verified host. Otherwise expose the same
  localized string as the control's native name and document the missing relationship. Required state
  belongs on the control or group; the marker alone is insufficient.
- **LBL-004:** A label click on a bound editor requests focus, or on a bound choice requests its action
  once. An absent, disabled, detached or group target receives no action. Label adds no keyboard stop.

## Platform behavior

The target is Input's **editor**, not its outer view; a Checkbox or Radio already has a single
choice target. Do not add a second interactive element to either control. Inspect the UIA
relationship and the AX title element on their respective hosts. A matching accessible name
is the agreed fallback, not evidence that the relationship exists. See [accessibility](spec/accessibility.md).

## Divergences

- `explicit-label-binding` — **accepted.** Native views do not automatically connect text to the
  next form element. A stable identity supports naming; an explicit, guarded owner operation supports clicking.
- `meaningful-label-content` — **accepted.** A design placeholder is not a usable field name; require content.

## Conformance

Draft only. Type cases should distinguish each target kind. Runtime cases should cover disabled and
replaced targets, marker presence and exactly-once delegation. Native cases must separately observe
focus, name, relationship and action on Windows Fabric, Office Win32 and macOS Paper/Fabric.
No implementation, public export or native result is claimed.
