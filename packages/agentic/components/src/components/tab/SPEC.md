---
name: tab
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Tab

## Scope

Tab is a single selectable item that switches which panel of content is shown.
It renders a `Pressable` containing an optional icon and, in the default layout,
a text label; it reports presses and renders either its standalone props or the
selection and roving-focus state supplied by TabList.

Tab does not own selection and does not render the panel. Use TabList to own
group selection, list semantics, orientation, and arrow-key navigation. Tab can
still render standalone under a caller-managed group. Tab is also not a
navigation link, not a toggle button, and has no overflow, close, badge, or
counter affordance.

## Public contract

### Props and defaults

| Prop       | Type                        | Default       | Contract                                                                                                  |
| ---------- | --------------------------- | ------------- | --------------------------------------------------------------------------------------------------------- |
| `controls` | `string`                    | required      | Identifier of the panel this tab shows; forwarded to the platform as the controlled-element relationship. |
| `selected` | `boolean`                   | `false`       | Externally driven when standalone; TabList context takes precedence inside a group.                       |
| `value`    | `string`                    | `controls`    | Stable TabList selection value.                                                                           |
| `disabled` | `boolean`                   | `false`       | Blocks presses, removes the tab from the tab order, and selects the disabled colors.                      |
| `layout`   | `iconAndText \| iconOnly`   | `iconAndText` | Selects the anatomy, the corner radius, and the padding.                                                  |
| `onPress`  | `PressableProps['onPress']` | none          | The only signal a tab emits. The caller changes `selected` in response.                                   |
| `style`    | `StyleProp<ViewStyle>`      | none          | Applied after the resolved root styles.                                                                   |

`layout: 'iconOnly'` is a distinct type shape: it requires `accessibilityLabel`
and `icon`, and rejects `content`. The compiler enforces all three.

**TAB-001:** Require `controls`, default `selected`, `disabled`, and `layout`,
and reject an icon-only tab at compile time unless it supplies both an icon and
an accessibility label and omits text content.

**TAB-002:** Render standalone selection without mutating it, consume TabList
selection when grouped, and preserve `onPress` while reporting group
interaction to the parent.

### Slots and anatomy

| Slot           | Type        | Rendered                   | Contract                                                        |
| -------------- | ----------- | -------------------------- | --------------------------------------------------------------- |
| `root`         | `Pressable` | always                     | The hit area and the accessible element.                        |
| `icon`         | `Icon`      | when supplied              | The resting icon; the only icon in the icon-only layout.        |
| `selectedIcon` | `Icon`      | when supplied and selected | Replaces `icon` while selected, typically the filled variant.   |
| `content`      | `Text`      | `iconAndText` layout       | Defaults to the text `Tab`; forced off in the icon-only layout. |

Render order inside the root is: focus visual, active icon, then content. The
active icon is `selectedIcon` when selected and a selected icon was supplied,
and `icon` otherwise.

The content is rendered through a layout-stable text wrapper: an internal
duplicate of the label is drawn at the selected weight with zero opacity to
reserve width, and the visible label is positioned over it. That internal
duplicate is hidden from assistive technology and is not a public slot.

**TAB-003:** Render the focus visual, then the active icon, then the content,
and swap to `selectedIcon` only while selected and only when one was supplied.

**TAB-004:** Reserve the selected-weight width for the label with a hidden
duplicate and overlay the visible label, so selecting a tab changes its weight
without moving the tab or its neighbors.

### State ownership

Tab owns no selection state. Hover, press, and focus come from the shared
pressable state and drive colors and the focus visual. Standalone visible state
comes from `selected` and `disabled`; TabList context owns those values,
focusability, set position, and keyboard navigation when present.

**TAB-005:** Resolve the background and foreground from selected, disabled,
pressed, and hovered state through the shared interactive precedence, and apply
the same resolved foreground to the icon and to both text layers.

**TAB-006:** Select the corner radius and padding from `layout`, and give the
icon the same fixed size in both layouts.

**TAB-007:** Expose the root as a tab with the selected and disabled state and
the controlled-panel relationship, merging caller state underneath, and drop a
disabled tab from the tab order.

**TAB-008:** Show the two-ring focus visual while the root is focused and not
disabled, following the corner radius of the active layout.

## Platform behavior

Windows and macOS behave identically. A standalone root is focusable while
enabled and non-focusable while disabled. Inside TabList, exactly one enabled
Tab is focusable and the parent moves that roving focus with orientation-aware
arrows, Home, and End.

On Windows the root maps to a UI Automation tab item that exposes its selected
state, and the controlled-panel identifier is forwarded so Narrator can move to
the panel. On macOS it maps to the equivalent tab element for VoiceOver, which
reads the name, the control type, and the selected state. Disabled tabs stay in
the accessibility tree and report the disabled state.

Hover changes the background and foreground on both platforms; pressed takes
precedence over hover.

## Divergences from Flex

| ID                                | Disposition | React Native contract                                                                                                                                                                            | Follow-up                                                                                                 |
| --------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `tab-disabled-focusability`       | Accepted    | A disabled tab is removed from the tab order and cannot be focused, while still reporting its disabled state. Flex keeps a disabled tab reachable so its state can be discovered by keyboard.    | None for this component. Reachability would have to come from a list container that manages roving focus. |
| `tab-list-navigation-not-shipped` | Resolved    | TabList now coordinates group selection, roving focus, orientation-aware arrows, Home and End, disabled-item skipping, and the selection-follows-focus policy.                                   | Implemented by the adjacent TabList contract and integration tests.                                       |
| `tab-focus-modality`              | Accepted    | The focus visual appears whenever the root is focused, including after a press. Flex shows it only for keyboard-modality focus.                                                                  | None. React Native exposes no focus modality on these platforms.                                          |
| `tab-selected-weight-reservation` | Accepted    | The selected label is heavier than the resting label, and the width for that heavier text is reserved on every tab so selection does not reflow the list. Flex describes only the weight change. | None. The reservation is an implementation requirement of the shared text layout, not a visual addition.  |

## Conformance

| Requirement | Evidence                                                         |
| ----------- | ---------------------------------------------------------------- |
| TAB-001     | `tab.types.ts`, `useTab.ts`, `tab.types.test.ts`, `tab.test.tsx` |
| TAB-002     | `useTab.ts`, `tab.test.tsx`                                      |
| TAB-003     | `renderTab.tsx`, `tab.test.tsx`                                  |
| TAB-004     | `renderTab.tsx`, `useTab.ts`, `useTabStyles.ts`, `tab.test.tsx`  |
| TAB-005     | `tab.styles.ts`, `useTabStyles.ts`, `tab.test.tsx`               |
| TAB-006     | `tab.styles.ts`, `useTabStyles.ts`, `tab.stories.tsx`            |
| TAB-007     | `useTab.ts`, `tab.test.tsx`                                      |
| TAB-008     | `useTabStyles.ts`, `tab.test.tsx`                                |
