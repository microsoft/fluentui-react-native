---
name: link
platform: react-native (Windows, macOS)
status: implemented
source: ./spec/source.json
tokens: ./spec/tokens.yaml
accessibility: ./spec/accessibility.md
interaction: ./spec/interaction.md
usage: ./spec/usage.md
---

# Link

## Scope

Link is a run of interactive text that takes the user somewhere else: a URL, a
route, or a location the caller resolves itself. It renders a native `Text`
root holding a label and, when asked, a trailing glyph.

Link navigates. It is not a button, not a toggle, and not a menu trigger; it
owns no overlay, no selection, and no list behavior. It does not resolve routes,
does not know whether a destination exists, and does not remember where the user
has already been.

Because Link's foreground is the same neutral color as surrounding body text,
the underline is the only visual signal that the text is interactive. Every
decision below follows from that.

## Public contract

### Props and defaults

| Prop                | Type                       | Default      | Contract                                                                                            |
| ------------------- | -------------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| `typeSet`           | `functional \| content`    | `functional` | Selects the typographic family used when the link is not inline.                                    |
| `inline`            | `boolean`                  | `false`      | Keeps the underline visible at rest and lets the surrounding text style supply the typography.      |
| `disabled`          | `boolean`                  | `false`      | Blocks navigation and presses, leaves the tab order, and selects the disabled foreground.           |
| `url`               | `string`                   | none         | Opened through React Native `Linking` after `onPress` returns.                                      |
| `onPress`           | `TextProps['onPress']`     | none         | Always called first on activation, whether or not `url` is set.                                     |
| `onNavigationError` | `(error: unknown) => void` | none         | Receives a `Linking.openURL` rejection. Without it the rejection is left untouched, never absorbed. |
| `content`           | `OptionalSlot<Text>`       | `Link`       | The label. Carries the underline and the type-set typography. `null` suppresses it.                 |
| `icon`              | `OptionalSlot<Icon>`       | none         | Trailing glyph. Rendered only when supplied; never underlined.                                      |
| `style`             | `StyleProp<TextStyle>`     | none         | Applied after the resolved root styles.                                                             |

**LNK-001:** Resolve `typeSet`, `inline`, and `disabled` to the documented
defaults and expose the remaining owned text props, including `ref`, on the
root.

### Slots and anatomy

| Slot      | Type   | Rendered           | Contract                                                                                 |
| --------- | ------ | ------------------ | ---------------------------------------------------------------------------------------- |
| `root`    | `Text` | always             | The hit area, the focus target, and the only accessible element.                         |
| `content` | `Text` | unless suppressed  | Nested text run that carries the underline, the type-set typography, and the foreground. |
| `icon`    | `Icon` | only when supplied | Trailing glyph inside the same text run. Never underlined, never separately accessible.  |

Render order inside the root is: content, then icon.

**LNK-002:** Render the label from the `content` slot with the placeholder text
`Link` when the caller supplies none, and render the trailing icon only when one
is supplied.

**LNK-003:** Render the content before the icon inside a single `Text` root so
the label and the glyph share one text run and one hit target.

### State ownership

Link owns exactly two pieces of interaction state, `pressed` and `focused`, both
derived from the root's own events. Everything else — the destination, the type
set, whether the link is inline, and whether it is disabled — is caller-owned
and never changed by the component. Activating a link does not change any Link
state; it runs the caller's handler and then navigates.

**LNK-004:** Track `pressed` from the root's press events and `focused` from the
root's focus events, and change no caller-owned prop in response to activation.

**LNK-005:** Call `onPress` on every activation, then open `url` through
`Linking.openURL` when one is set, and do neither while disabled.

**LNK-006:** Report a `Linking.openURL` rejection to `onNavigationError` when
the caller supplies one and otherwise leave the rejection untouched, so a failed
navigation is never absorbed by Link.

**LNK-007:** Resolve the foreground from the disabled and pressed states only, so
a link reads at body-text color at rest, takes the theme's pressed override of
that token while it is being pressed, and takes the disabled foreground while it
is unavailable. A theme that maps the pressed override to the rest value
produces no visible shift, which is correct.

**LNK-008:** Show the underline whenever the link is inline, pressed, or
focused, and hide it otherwise, so a non-inline link acquires its affordance the
moment it is touched or reached.

**LNK-009:** Apply the type-set typography only when the link is not inline, so
an inline link inherits the font family, size, and line height of the text it
sits in.

**LNK-010:** Expose the root as a link with the disabled state merged over
caller-supplied accessibility state, keep a disabled link out of the tab order,
and require an accessible name when the label is suppressed.

**LNK-011:** Draw a single focus border on the root, in the focus stroke color
and the base corner radius, while the root is focused and not disabled, holding
the same border width transparently at rest so focus does not move the text.

**LNK-012:** Size the trailing glyph at 16 and paint it with the resolved
foreground, separating it from the label with horizontal space inside its own
inline box.

## Platform behavior

Windows and macOS both render the root as a native `Text`. The root is focusable
while enabled and leaves the tab order while disabled; Enter activates the
focused link through the platform's press handling. On Windows the root maps to
a UI Automation hyperlink that reports its disabled state; on macOS it maps to
the equivalent link element for VoiceOver. The trailing glyph is not accessible
on either platform, so a link is always exactly one control.

Two capabilities that a browser supplies are absent on both platforms. There is
no hover reporting on a text run, so the underline cannot appear under a
stationary pointer; and there is no navigation history, so no link can know it
has been visited. Both are recorded as divergences below rather than emulated.

Navigation is delegated entirely to `Linking.openURL`. Whether a scheme resolves,
which application handles it, and whether a new window appears are decided by the
operating system, not by Link.

## Divergences from Flex

| ID                                           | Disposition | React Native contract                                                                                                                                                                                                                     | Follow-up                                                                                              |
| -------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `link-visited-state-unsupported`             | Accepted    | There is no visited state and none is tracked. React Native has no navigation history for a text run, and Flex specifies Visited as pixel-identical to Rest, so nothing is lost visually.                                                 | None. A host that tracks its own history can style a visited link through `style`.                     |
| `link-hover-state-unsupported`               | Accepted    | There is no hovered state. A non-inline link reveals its underline on press and on focus instead of on hover.                                                                                                                             | Needs hover reporting on a text run before the Flex hover step can be adopted.                         |
| `link-underline-geometry-unsupported`        | Accepted    | Only underline presence is portable. The dotted style is requested for the content type set and ignored by both target platforms, and the thin-versus-thick thickness and the 15% offset have no React Native expression at all.          | Needs text-decoration thickness, offset, and style support in the platform text stack.                 |
| `link-focus-ring-is-single-border`           | Deferred    | Focus is drawn as one border on the root text box, in the outer focus stroke color, rather than the universal dual ring. The `FocusVisual` primitive composes `View` rings, which cannot be nested inside a text run.                     | Needs a text-flow focus visual before the dual ring can be used.                                       |
| `link-inline-focus-border-may-be-inert`      | Deferred    | An inline link nested inside a paragraph may not paint its focus border, because the platforms lay nested text out as an attributed string and can drop box decorations. An inline link is still focusable and still keeps its underline. | Needs per-platform verification of nested-text border painting.                                        |
| `link-icon-gap-is-inline-padding`            | Accepted    | React Native lays `Text` children out with the text engine, which has no `gap`, so the label-to-glyph spacing is carried as horizontal space inside the glyph's own inline box.                                                           | None. This is the only portable way to space an inline glyph from its label.                           |
| `link-url-prop-name`                         | Accepted    | The destination prop is named `url` rather than `href`, matching the existing public FURN `Link` so callers can move between the two without renaming.                                                                                    | None.                                                                                                  |
| `link-navigation-does-not-supersede-onpress` | Accepted    | `onPress` runs on every activation and `url` navigation happens afterwards. The existing public FURN `Link` treats `url` as superseding `onPress`; suppressing a caller's handler is not a behavior this package will reproduce.          | None.                                                                                                  |
| `link-no-state-transition`                   | Accepted    | The pressed foreground change is applied immediately with no transition, and underline visibility changes are instant, which Flex also requires.                                                                                          | Needs motion tokens and an animated color layer before the eased foreground transition can be adopted. |

## Conformance

| Requirement | Evidence                                                             |
| ----------- | -------------------------------------------------------------------- |
| LNK-001     | `link.types.ts`, `useLink.ts`, `link.types.test.ts`, `link.test.tsx` |
| LNK-002     | `useLink.ts`, `link.test.tsx`                                        |
| LNK-003     | `renderLink.tsx`, `link.test.tsx`                                    |
| LNK-004     | `useLink.ts`, `link.test.tsx`                                        |
| LNK-005     | `useLink.ts`, `link.test.tsx`                                        |
| LNK-006     | `useLink.ts`, `link.test.tsx`                                        |
| LNK-007     | `link.styles.ts`, `useLinkStyles.ts`, `link.test.tsx`                |
| LNK-008     | `link.styles.ts`, `useLinkStyles.ts`, `link.test.tsx`                |
| LNK-009     | `link.styles.ts`, `useLinkStyles.ts`, `link.test.tsx`                |
| LNK-010     | `useLink.ts`, `link.test.tsx`                                        |
| LNK-011     | `link.styles.ts`, `useLinkStyles.ts`, `link.test.tsx`                |
| LNK-012     | `link.styles.ts`, `useLinkStyles.ts`, `link.test.tsx`                |

The Flex source identities in `spec/source.json` were recorded from the pinned
`flex-1.5.0-206c4996` plugin payload available locally. The origin-repository
lineage for those files could not be reached from the authoring environment, so
the recorded origin digests repeat the locally verified Marketplace digests and
must be re-verified by running `report:spec-source-drift --write
--update-sources --component link` with credentialed access.
