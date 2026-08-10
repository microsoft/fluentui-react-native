# PresenceBadge native specification

## Fluent UI Web references

- `packages/react-components/react-badge/library/src/components/PresenceBadge/PresenceBadge.types.ts`
- `packages/react-components/react-badge/library/src/components/PresenceBadge/usePresenceBadge.tsx`
- `packages/react-components/react-badge/library/src/components/PresenceBadge/usePresenceBadgeStyles.styles.ts`
- `packages/react-components/react-badge/library/src/components/PresenceBadge/presenceIcons.ts`

## Native design

`PresenceBadge` is an accessible image `View` containing a non-accessible SVG icon. Size-specific outer dimensions match Web while a 16-unit vector view box keeps status artwork sharp on every native density. Theme background aliases avoid edge bleed around regular icons.

## Implemented behaviors

- Six sizes and all available, away, busy, do-not-disturb, offline, out-of-office, unknown, and blocked statuses.
- Web-equivalent filled/regular icon selection for every `outOfOffice` combination.
- Fluent semantic status colors and neutral backing/border treatment.
- Generated accessible image labels with consumer override support.

## Behaviors not implemented

| Web behavior | Reason not implemented natively |
| --- | --- |
| CSS `background-clip` antialiasing workaround | Native uses a clipped circular backing and border around the SVG. |
| DOM icon slot replacement | Presence artwork is intentionally fixed so status and label remain consistent. |
| Focus behavior | Presence is an informational image, not an interactive control. |

## Exposed property mappings

| Fluent UI Web property | React Native property | Web type/default | Native type/default | Mapping or adaptation |
| --- | --- | --- | --- | --- |
| status | status | 8 statuses; available | Same | Direct mapping. |
| outOfOffice | outOfOffice | boolean; false | Same | Direct icon/color modifier mapping. |
| size | size | 6 Badge sizes; medium | Same | Presence dimensions are 6/10/12/16/20/28. |
| aria-label | accessibilityLabel | generated status label | Same generated label | Native accessibility naming with override. |
| role="img" | accessibilityRole="image" | image | image | Native semantic equivalent. |

## Native-only properties

| Native property | Type/default | Rationale |
| --- | --- | --- |
| accessible | boolean/true | Controls native accessibility grouping. |
| ViewProps | React Native view props | Native layout, accessibility, testing, and event integration. |

## Web properties not exposed

| Fluent UI Web property | Web purpose | Reason omitted from native API |
| --- | --- | --- |
| root/icon `className` and `as` | DOM styling and polymorphism | DOM/CSS-only. |
| icon slot | Replace status artwork | Would allow label/visual disagreement and is not required for native parity. |

## Accessibility

The root is accessible by default with role `image`. Labels are `available`, `away`, `busy`, `do not disturb`, `offline`, `out of office`, `unknown`, or `blocked`. The modifier appends `out of office` except when status already is out-of-office.

## Motion and animation mapping

| Web transition or animation | Native implementation | Duration/easing | Reduced-motion behavior |
| --- | --- | --- | --- |
| None | None | N/A | N/A |

## Tests and Storybook coverage

Unit tests cover default semantics, every status label, out-of-office label behavior, size geometry, modifier icon selection, and rendered SVG artwork. Storybook integration is outside the requested directories.
