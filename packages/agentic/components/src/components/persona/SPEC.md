---
name: persona
platform: react-native (Windows, macOS)
status: contract-draft
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Persona

## Scope

A noninteractive identity summary with a portrait, name, optional supporting lines and optional availability. A
profile link or selectable row is an enclosing component's responsibility.

## Public contract

| Proposed prop                                          | Default                           | Purpose                                                                                                                                             |
| ------------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name / secondaryText / tertiaryText / quaternaryText` | required name / absent            | Keep useful supplied lines in logical reading order; omit absent lines without blank rows.                                                          |
| `avatar / size`                                        | identity content / `32`           | Use Avatar's supported discrete sizes. Choose either an informative portrait or treat it as decorative when the name already identifies the person. |
| `layout / alignment`                                   | `afterAvatar` / `top`             | Text before, after or below portrait; top or center alignment where beside it. Logical order must work in RTL.                                      |
| `presence / formatIdentity`                            | hidden / caller-localized summary | Visible presence is a separate approved status meaning, never inferred from the activity ring. No live announcement by default.                     |

### Slots and ownership

Nonfocusable root View/ref; Avatar, optional PresenceBadge and a wrapping text column. The identity can be
readable as a standalone summary or form the name and description of a containing action. No nested profile
button.

Related contracts used by this design: [PresenceBadge](../presence-badge/SPEC.md), [Avatar](../avatar/SPEC.md), [Text](../text/SPEC.md).

### Data and callbacks

`name` is required independently of image load. Optional secondary, tertiary and quaternary lines remain in the
same semantic order for each layout. Do not derive an availability statement from an image color, missing data
or a reused person's previous props.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **PSN-001:** Render the supplied identity and supported optional lines consistently when people are recycled. Never manufacture an online status for a missing value.
- **PSN-002:** Switch portrait/text layout without changing the content hierarchy; preserve wrapping and scaling and keep badge placement logical.
- **PSN-003:** Convey name and meaningful availability once. Avoid duplicate speech from the portrait, badge and enclosing control while keeping substantive supporting text discoverable.
- **PSN-004:** Persona owns no focus, press or keyboard state. An enclosing link or command remains the only interactive owner.

## Platform behavior

Do not widen the existing Avatar contract by implication. Visible integrated presence is gated on an explicitly
supported host composition; Persona without a presence mark can be reviewed independently.

## Divergences from Flex

- `persona-host-semantics` — **accepted.** Choose one accessibility owner for the context; an identity summary does not make a native row actionable.
- `persona-visible-presence` — **deferred.** Separate the integration with Avatar from approval of the Persona layout or PresenceBadge artwork.

## Conformance

Compare standalone and nested output with two and four lines, with and without presence. Switch identities on a
reused row and confirm names, status, layout and number of targets.

Draft for Windows Fabric, Office Win32, macOS Fabric and macOS Paper. The [requirement evidence](spec/source.json) is planned; no runtime export or native qualification is claimed.

Review the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md) with this draft.
