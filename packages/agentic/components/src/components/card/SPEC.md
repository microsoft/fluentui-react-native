---
name: card
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Card

## Scope

Card is a bounded React Native surface for related content. It owns surface styling, optional interactive overlay, selection presentation, responsive direction, and slot order. It does not supply a title, text typography, navigation destination, selection manager, or a schema for the supplied slot contents.

## Public contract

`size` defaults to `small`; `padding` to `default`; `layout` to `default`; `direction` to `vertical`; and `disabled` to `false`. Size accepts `small` or `large`; padding accepts `default` or `none`; layout accepts `default`, `nested`, or `structured`; direction accepts `vertical` or `horizontal`. `selected` is optional and externally driven: its presence makes the card selectable, but press only calls the supplied `onPress`.

`root` and `content` are required. `header`, `content02`, and `footer` are optional. Rendering always begins with the interactive overlay when enabled. `default` renders content only. `nested` renders content followed by `content02`. `structured` renders header, content, optional `content02`, and footer. Each supplied public slot is a `View` slot; Card does not add child layout beyond its section style.

Providing `onPress` or `selected` enables the pressable overlay. The resolved state derives interactive and selectable state, direction after the current window-width check, pressable hover/pressed/focused values, theme state, and user root style. A horizontal card becomes vertical below 480 React Native layout units. Surface state precedence is selection, then disabled, pressed, and hovered; user style is final.

### Requirements

- **CRD-001:** Resolve the documented variants and default values, derive interactivity from `onPress` or the presence of `selected`, and collapse horizontal direction below the implementation width threshold.
- **CRD-002:** Render the overlay and public slots in the layout-specific order without injecting a content schema.
- **CRD-003:** Apply root, nested-content, interaction, focus, and user-style layers from the verified FURN bindings.
- **CRD-004:** Keep static cards non-focusable by default and expose interactive cards as disabled-aware pressable buttons with persistent focus feedback.
- **CRD-005:** Preserve externally owned selection and keep nested slot controls independently usable.

## Platform behavior

Static cards use a non-focusable `View`. A caller can explicitly make a static root accessible; then it uses React Native group role and preserves its label and accessibility state. Interactive cards hide the structural root from accessibility and expose an absolute-fill React Native `Pressable` overlay with button role, disabled state, optional selected state, and `FocusVisual`.

On Windows and macOS, interactive overlays respond to native pointer, touch, `Enter`, and `Space` press behavior. The overlay is disabled and unfocusable when `disabled`; nested controls remain rendered as sibling content and keep their own press behavior. Windows maps the overlay to a UI Automation button; macOS maps it to an AX button. The component does not navigate, manage a card collection, or animate state changes.

## Divergences from Flex

- `card-button-only-activation` — **accepted.** The FURN interactive path always uses a React Native pressable button; it has no separate link or navigation-destination contract.
- `card-static-accessibility-opt-in` — **accepted.** FURN cannot infer a title-to-region association from generic `View` slots. Static cards are hidden from accessibility by default and become a labeled group only when the caller explicitly sets `accessible`.

## Conformance

| Requirement | Evidence                                                                  |
| ----------- | ------------------------------------------------------------------------- |
| CRD-001     | `card.types.ts`, `useCard.ts`, `card.stories.tsx`                         |
| CRD-002     | `useCard.ts`, `renderCard.tsx`, `card.types.test.tsx`, `card.stories.tsx` |
| CRD-003     | `card.styles.ts`, `useCardStyles.ts`, `card.test.tsx`                     |
| CRD-004     | `useCard.ts`, `useCardStyles.ts`, `card.test.tsx`                         |
| CRD-005     | `useCard.ts`, `renderCard.tsx`, `card.test.tsx`, `card.stories.tsx`       |
