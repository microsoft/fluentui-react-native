---
name: split-button
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.json
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# SplitButton

## Scope

A default command and an adjacent menu of alternatives. The menu is not a second way of clicking the entire
control and selecting an alternative does not implicitly replace the default command.

## Public contract

| Proposed prop                       | Default                            | Purpose                                                                                                                |
| ----------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `content / onPress`                 | required                           | The primary button's visible command and its activation handler.                                                       |
| `menuLabel / children`              | required                           | Localized action name for the menu side and Menu's command items. A tooltip can supplement but never supply that name. |
| `appearance / shape / size`         | `secondary` / `rounded` / `medium` | primary, secondary or outline; rounded or circular; small, medium or large.                                            |
| `open / defaultOpen / onOpenChange` | uncontrolled, closed               | Menu presence only. Forward Menu's reasoned changes. Disabled prevents both regions acting and forbids presentation.   |

### Slots and ownership

Structural View ref enclosing sibling primary and menu triggers. The inner divider and chevron have no action.
Anchor to the actual menu trigger and use the shared family of menu surfaces; do not create two nested Buttons
around the chevron.

Related contracts used by this design: [Button](../button/SPEC.md), [MenuButton](../menu-button/SPEC.md), [Menu](../menu/SPEC.md).

### Data and callbacks

`onOpenChange(next, { reason })` follows the Menu family (`trigger`, `dismiss`, `action`). It is not emitted for
a primary press or for externally supplied open changes. Hold both native targets stable while the menu
appears/disappears; the public root ref does not become the popup handle.

The public React 19 `ref` remains on the declared root. A supported View/Pressable root forwards `tooltip?: string`
only to that root; it does not use the tip as a name, description or popup relationship. Caller visual styles apply last.

### Requirements

- **SPB-001:** Expose distinct handlers and names, with expanded state only on the menu side.
- **SPB-002:** Primary activation runs the command without opening. Menu-side activation/opening keys never run the default command.
- **SPB-003:** Make the divider and each region's focus boundary legible on both brand and neutral backgrounds, including at the small size.
- **SPB-004:** Expose two consecutive stops; on Escape return to the menu trigger. Respect outside-click focus and gate natural popup-boundary continuation on the host.

## Platform behavior

Reuse MenuButton's actual presence and native action routing. A collapsed/expanded property does not establish a
relationship with the menu; inspect that relationship on all four endpoints.

## Divergences from Flex

- `independent-split-targets` — **accepted.** Use sibling native targets with their own focus feedback; never hide the menu behind a long press.
- `split-popup-continuation` — **deferred.** Owner-relative forward continuation on Office Win32 is a shared menu capability, not proved by a successful open.

## Conformance

Open and Escape repeatedly from the second region, select a menu command, then invoke the first region; observe
distinct callbacks and the real focus destination after each.

The [requirement evidence](spec/source.json) separates the implemented visual and action owners from native
focus restoration and popup association, which still need endpoint qualification.

See the [token bindings](spec/tokens.json), [accessibility](spec/accessibility.md), [interaction](spec/interaction.md) and [usage](spec/usage.md).
