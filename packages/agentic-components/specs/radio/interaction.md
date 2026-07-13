---
component: Radio
platform: react-native (Windows, macOS)
---

# Radio Interaction (React Native — Windows & macOS)

## Keyboard navigation

Radio does not own its keyboard contract — navigation operates at the group level. See `flex-components:radio-group` `interaction.md` for the full keyboard model (Tab, arrow keys, Space, Home/End, and disabled-skip behavior).

Radio-specific note: selecting a Radio via arrow keys simultaneously moves focus and changes the selection — this differs from Checkbox, where Tab moves focus and Space toggles independently.

## Focus management

Radio does not manage its own focus within a group — focus management lives at the parent RadioGroup level. For native `<input type="radio">` siblings sharing a `name` attribute, the platform provides the single-tab-stop behavior; do not set `tabindex` on the inputs. For custom radios (non-native elements using `role="radio"`), RadioGroup implements roving tabindex — only the currently selected Radio (or the first one if none is selected) carries `tabindex="0"`, and others have `tabindex="-1"`. Either way, the focus ring wraps the entire interactive area (indicator + label), not just the indicator. Focus visualization uses the universal dual-outline focus ring — see `flex-system:styling`.

## Pointer interaction

Clicking the label area toggles the Radio's selection — this is the platform-native `<label for>` behavior provided by the composed `flex-components:label` sub-component, and applies in both native and custom implementations. The pointer hit area therefore covers the full root container (indicator + label), not just the indicator circle.

## Animation

Status transitions (Unselected → Selected) may include a brief dot scale-in animation. State transitions (Rest → Hover) are platform-driven color transitions.

> **Reduced motion:** When the OS reduce-motion setting is set, all transitions should be instant (duration 0ms). No scale, translate, or opacity animation.
