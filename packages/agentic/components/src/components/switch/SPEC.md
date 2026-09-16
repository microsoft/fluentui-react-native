---
name: switch
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Switch

## Scope

Switch is a two-state control whose interaction _is_ the state change: pressing
it turns a setting on or off and the result applies immediately. It renders a
`Pressable` hit area containing a rounded track and a thumb that slides between
the two ends, optionally paired with text labels that the component lays out.

Switch is not a checkbox (no indeterminate state and no deferred submit), not a
toggle button, and not a form field: it has no error, required, or validation
surface, no description or hint slot, and no group behavior. It never confirms,
never defers, and never renders on and off captions inside the track.

## Public contract

### Props and defaults

| Prop             | Type                               | Default      | Contract                                                                                                           |
| ---------------- | ---------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `checked`        | `boolean`                          | none         | Supplying it makes the switch externally driven: the rendered value only changes when the caller passes a new one. |
| `defaultChecked` | `boolean`                          | `false`      | Starting value while the switch is internally driven. Ignored when `checked` is supplied.                          |
| `onChange`       | `(checked: boolean) => void`       | none         | Called with the next value on every accepted interaction, in both the externally and internally driven cases.      |
| `disabled`       | `boolean`                          | `false`      | Blocks the toggle, removes the switch from the tab order, and selects the disabled colors.                         |
| `label`          | `string`                           | `'Label'`    | Text used for the rendered label slots, and as the accessible name when no label is visible.                       |
| `labelBefore`    | `boolean`                          | `true`       | Renders the label before the control in the `horizontal` layout.                                                   |
| `labelAfter`     | `boolean`                          | `true`       | Renders the label after the control in the `horizontal` layout.                                                    |
| `layout`         | `switch \| horizontal \| vertical` | `horizontal` | Selects which label slots render and how the container stacks them.                                                |
| `onPress`        | `PressableProps['onPress']`        | none         | Forwarded after the toggle has been applied.                                                                       |
| `style`          | `StyleProp<ViewStyle>`             | none         | Applied to the hit area after the resolved root styles, not to the outer container.                                |

The root accepts the remaining owned `PressableProps`; `accessibilityRole` is
fixed and caller `accessibilityState` is merged under the component's own
checked and disabled state.

**SWCH-001:** Resolve `checked`, `defaultChecked`, `disabled`, `label`,
`labelBefore`, `labelAfter`, and `layout` to the documented defaults, and treat
the switch as externally driven whenever `checked` is supplied.

**SWCH-002:** Toggle from the root press handler and independently from the
explicit recognized-key handler, call `onChange` with the requested next value,
forward caller handlers in the documented order, and accept no state change
while `disabled`.

### Slots and anatomy

| Slot          | Type            | Rendered                               | Contract                                                               |
| ------------- | --------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| `root`        | `Pressable`     | always                                 | The hit area and the accessible element; carries the caller's `style`. |
| `track`       | `Animated.View` | always                                 | The rounded, bordered rail; hidden from assistive technology.          |
| `thumb`       | `Animated.View` | always                                 | Absolutely positioned inside the track; slides between the ends.       |
| `beforeLabel` | `Text`          | `horizontal` layout when `labelBefore` | Defaults to `label`; pass `null` to suppress it.                       |
| `afterLabel`  | `Text`          | `horizontal` layout when `labelAfter`  | Defaults to `label`; pass `null` to suppress it.                       |
| `aboveLabel`  | `Text`          | `vertical` layout                      | Defaults to `label`; pass `null` to suppress it.                       |

An internal container `View` wraps the whole component and owns the layout
direction, gap, and padding; it is not replaceable. Render order is: container,
then per layout — `switch` renders the hit area alone, `horizontal` renders
before label, hit area, after label, and `vertical` renders the above label then
the hit area. Inside the hit area the optional `FocusRing` renders first, then the
track, and the thumb renders inside the track.

Because both label flags default to `true`, the default `horizontal` layout
renders the label text on _both_ sides of the control. Callers that want a
single label set the flag for the side they do not want to `false`, or pass
`null` to that slot.

**SWCH-003:** Render the container, the layout-selected label slots, and the hit
area in the documented order, default each rendered label slot to the `label`
text, and drop a label slot when it is passed `null`.

### State ownership

The switch owns its checked value only while `checked` is absent. Hover, press,
and focus come from the shared pressable state and drive colors and the focus
visual; nothing else is stateful. The animated progress value that drives the
thumb and the color crossfade is derived from the checked value, never the
source of it, so an externally driven switch that never receives a new `checked`
value never moves.

**SWCH-004:** Drive track and thumb colors from checked, disabled, pressed, and
hovered state through the shared interactive precedence, and interpolate the
track and thumb colors together with the thumb position from one progress value.

**SWCH-005:** Follow the [shared focus visual policy](../AGENTS.md#focus-visual-policy)
on the hit-area root, not the label container or track. Retain the mounted
two-ring visual and its root-radius geometry for the custom path.

**SWCH-006:** Expose the root as a switch to assistive technology with the
checked and disabled state merged over any caller-supplied state, and derive the
accessible name from `label` when the caller supplies none.

**SWCH-007:** Keep the thumb travel equal to the track width minus the two
border widths, the two inset offsets, and the thumb width.

**SWCH-008:** Animate the thumb and colors over a short eased transition, skip
the animation on first mount, and snap to the end value while the platform
reduced-motion setting is on.

## Focus visuals

The state hook uses `useFocusVisuals` to create a private optional `FocusRing`.
Windows and macOS request the system ring by default, without a custom subtree.
Win32 and other platforms use the custom ring, visible only while focused and
the scene's current input modality is keyboard. Programmatic focus follows the
last root modality. Disabled and noninteractive targets never show custom feedback.

The composition hook supports an explicit `useSystemFocusRing` override.
`alwaysVisible` selects the custom path and bypasses modality while focused;
it does not make an unfocused target visible or move native focus. Custom rings
stay mounted across focus/blur. `applyFocusRingStyles` supplies shared theme
colors and widths; component style hooks preserve their resolved radius.
These hook options do not add new component props. Scenes require `ThemedRoot`.

## Platform behavior

The root is focusable while enabled and drops out of the tab order when
disabled. Shared `useFocusablePressable` owns keyboard/press coordination.
Switch does not add a second key-up toggle. Its semantic accessibility toggle
resolves through Framework Base to `toggle` on Windows Fabric, `Toggle` on
Win32, and the existing `Toggle` custom action on macOS. Declaration and event
comparison use the same name, preserving caller labels and custom actions
without duplicate declarations. Accepted actions toggle before forwarding the
original caller event once; disabled and custom events are still forwarded
without a state change. Accessibility actions never synthesize `onPress`.

On Windows the root maps to a UI Automation toggle element and the on and off
state is exposed both through the native accessibility state and through the
checked property that react-native-windows forwards. Narrator announces the
name, the control type, and the new state after each toggle. On macOS it maps to
the equivalent switch element for VoiceOver. The disabled state is exposed on
both platforms rather than the control being removed.

Hover is a real state on both platforms and changes the track and thumb colors.
The color and position transition runs on the JavaScript driver because it
interpolates colors, which the native driver cannot animate.

## Divergences from Flex

`native-system-focus-visuals` is an **accepted** [shared native adaptation](../AGENTS.md#focus-visual-policy).

| ID                                | Disposition | React Native contract                                                                                                                                                         | Follow-up                                                                                                    |
| --------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `switch-label-association-ids`    | Resolved    | When the caller supplies no name, the component copies visible label text to the root as the single accessible-name mechanism and emits no unresolved labelled-by references. | Implemented in `useSwitch.ts` and covered by naming tests.                                                   |
| `switch-label-spacing`            | Accepted    | One container gap separates the control from whichever labels render. Flex distinguishes inner and outer label spacing per side.                                              | None. A single gap is the natural React Native flex-container expression and matches the inner spacing step. |
| `switch-focus-modality`           | Accepted    | Custom visibility follows keyboard modality from the scene root rather than a component-local pointer tracker. Native appearance remains renderer-owned.                      | Preserve the shared hook and component modality matrix.                                                      |
| `switch-keyboard-activation-path` | Resolved    | One shared activation path owns each key gesture; the component no longer toggles separately on key-up.                                                                       | Retain exact-count native keyboard and accessibility-action coverage.                                        |

## Conformance

| Requirement | Evidence                                                                     |
| ----------- | ---------------------------------------------------------------------------- |
| SWCH-001    | `switch.types.ts`, `useSwitch.ts`, `switch.types.test.ts`, `switch.test.tsx` |
| SWCH-002    | `useSwitch.ts`, `switch.test.tsx`                                            |
| SWCH-003    | `renderSwitch.tsx`, `useSwitch.ts`, `switch.test.tsx`                        |
| SWCH-004    | `switch.styles.ts`, `useSwitchStyles.ts`, `switch.test.tsx`                  |
| SWCH-005    | `useSwitch.ts`, `useSwitchStyles.ts`, `switch.test.tsx`                      |
| SWCH-006    | `useSwitch.ts`, `switch.test.tsx`                                            |
| SWCH-007    | `switch.styles.ts`, `switch.test.tsx`                                        |
| SWCH-008    | `useSwitch.ts`, `useSwitchStyles.ts`, `switch.stories.tsx`                   |
