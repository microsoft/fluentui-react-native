---
name: label
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Label

## Scope

Label is a non-interactive React Native text element that names an associated form control. It owns the label text, an optional trailing required indicator, the emphasis weight, the size scale, and the disabled foreground treatment. It does not own the associated control, the control's required or disabled semantics, field-level helper or validation text, activation forwarding, or the spacing between the label and the control it names.

## Public contract

`weight` defaults to `regular` and accepts `regular` or `strong`. `size` defaults to `medium` and accepts `small`, `medium`, or `large`. `required` and `disabled` default to `false`.

`root` is a React Native `View`. `content` is a required `Text` slot that renders by default with the text `Label`; a caller supplies a string, slot props, or an `as` replacement. `requiredIndicator` is an optional `Text` slot that renders only while `required` is `true`, defaults to the text `*`, and can be replaced or suppressed by the caller. The root does not accept `children`; label text goes through `content`. The root owns the accessible name, which is read from string `content` unless the caller sets `accessibilityLabel`.

Rendering order is `content` then `requiredIndicator`. The resolved state stores `weight`, `size`, `required`, `disabled`, theme state, and the user root style. Root style order is structural style, themed layout style, then user style. Text style order is structural style, themed typography style, then themed color style.

`Label` builds on the package `Text` component for both text slots, so both inherit theme-aware text defaults before Label applies its own typography and color bindings.

### Requirements

- **LBL-001:** Expose the documented `weight`, `size`, `required`, and `disabled` axes with their defaults, and reject `children` on the root in favor of the `content` slot.
- **LBL-002:** Render `content` first and render `requiredIndicator` only while `required` is `true`, including the default label text and default asterisk indicator.
- **LBL-003:** Map weight, size, and disabled state to the documented FURN typography, foreground, and gap bindings, and apply the user root style after component styles.
- **LBL-004:** Expose the label as a single native text element whose accessible name comes from string `content` or an explicit `accessibilityLabel`, keep both text slots out of the accessibility tree, and pass `nativeID` through so an associated control can reference the label.
- **LBL-005:** Remain non-interactive: no focus target, no press or hover handling, no motion, and no disabled accessibility state of its own.

## Platform behavior

Label renders a React Native `View` root that is marked accessible with the `text` role and owns the accessible name, so Windows UI Automation and macOS AX expose the label as one text element rather than as a container plus separate text runs. The name is read from string `content` unless the caller sets `accessibilityLabel`. The root is never focusable and never receives keyboard input on either platform.

Association is programmatic. A caller gives the label a `nativeID` and points the associated control at it with `accessibilityLabelledBy`, which is the convention used across this repository. The label itself does not know which control it names and does not change behavior when it is referenced.

Disabled changes foreground color only. Label does not report `accessibilityState.disabled`, because the associated control owns that state and reporting it twice would announce a disabled control twice.

## Divergences from Flex

- `label-activation-forwarding` (`not-applicable`): the source describes browser-native forwarding of a click on the labeling element to the associated control. React Native has no equivalent implicit association, and synthesizing it would require Label to own a control reference and a focus command it cannot safely hold. Callers wire association through `nativeID` and `accessibilityLabelledBy` instead, and a caller that wants press-to-focus composes Label inside its own pressable.
- `disabled-color-transition` (`not-applicable`): the source's motion guidance is a timed foreground color transition into the disabled state. Label has no animation surface in this implementation; the disabled foreground is applied immediately, which also matches the reduced-motion guidance in the source.

## Conformance

| Requirement | Evidence                                                                    |
| ----------- | --------------------------------------------------------------------------- |
| LBL-001     | `label.types.ts`, `useLabel.ts`, `label.types.test.ts`, `label.stories.tsx` |
| LBL-002     | `useLabel.ts`, `renderLabel.tsx`, `label.test.tsx`                          |
| LBL-003     | `label.styles.ts`, `useLabelStyles.ts`, `label.test.tsx`                    |
| LBL-004     | `useLabel.ts`, `label.test.tsx`                                             |
| LBL-005     | `label.types.ts`, `useLabel.ts`, `label.test.tsx`                           |
