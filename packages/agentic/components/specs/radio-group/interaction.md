---
component: RadioGroup
platform: react-native (Windows, macOS)
---

# RadioGroup Interaction (React Native — Windows & macOS)

## Keyboard navigation

- **Tab / Shift+Tab** — moves focus into the RadioGroup (landing on the currently-Selected Radio, or the first Radio if none is selected) and out of it. Tab does not move between Radios within the group.
- **Arrow Down / Arrow Right** — moves focus to the next Radio in the group and selects it. Wraps from the last Radio back to the first.
- **Arrow Up / Arrow Left** — moves focus to the previous Radio in the group and selects it. Wraps from the first Radio back to the last.
- **Space** — selects the currently focused Radio if it is not already selected. Redundant when arrow-key navigation already selects on focus, but supported for parity with native HTML.
- **Home / End** — optional; if implemented, moves focus to (and selects) the first or last enabled Radio in the group.
- **Disabled options** — skipped during arrow-key navigation; focus does not land on a Radio whose Disabled state would block selection.

Arrow-key bindings are the same in both Vertical and Horizontal orientations — Down/Right both advance, Up/Left both retreat. This matches native HTML radio behavior and avoids requiring users to think about orientation when navigating.

## Focus management

For **native HTML radios** (`<input type="radio">` grouped by a shared `name` attribute, optionally wrapped in a `<fieldset>` for accessible naming), the platform manages the single-tab-stop behavior for the group. Do not set `tabindex` on individual native radio inputs — overriding it can interfere with built-in focus and selection.

For **custom radio implementations** (non-native elements using `role="radio"`), RadioGroup uses **roving tabindex**: the group occupies a single tab stop, and arrow keys move the active tabindex between Radio children.

- The custom Radio that is currently Selected has `tabindex="0"`; all other custom Radios in the group have `tabindex="-1"`.
- If no custom Radio is Selected yet (initial state), the first enabled custom Radio carries `tabindex="0"`.
- Disabled custom Radios never carry `tabindex="0"` and are not reachable via arrow keys.

Focus visualization is owned by the focused Radio — RadioGroup itself has no focus ring. The Radio's focus ring (universal dual-outline pattern from `flex-system:styling`) wraps the entire interactive area of that one option (indicator + label). On focus return from outside the group (Shift+Tab from a later focusable, or programmatic refocus), focus lands on the same Radio that previously held it.

## Animation

No RadioGroup-level animations. Status transitions (Unselected → Selected) and state color shifts happen on the individual Radio child being activated — see `flex-components:radio` interaction.md for the per-Radio animation behavior.

> **Reduced motion:** Handled at the Radio child level — no RadioGroup-specific motion to reduce. When the OS reduce-motion setting is set, Radio's own transitions become instant.
