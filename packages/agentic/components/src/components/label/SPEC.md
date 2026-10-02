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

Label supplies a visible name and optional required marker for a native form
control. It can also supply the visual legend of RadioGroup. The consumer owns
the control or group, its accessible name, required/disabled semantics, and any
navigation. Label does not create an association, move focus, validate input,
or implement a group.

This is a local recovery implementation, not an endpoint qualification.
The reviewed donor at `fdc8914c6ee2ba124ccd68f3b9e0ef841a60342d` is the
compatibility starting point. Its component-local repairs through
`a0fe649874156980d393b2a739167692c893bee8` and later policy changes at
`d312d095e0c0b391427cc522743fe3514794ef83` were compared. Preserve the
unchanged axes, slot order, token bindings, and non-interactive behavior;
adapt the reviewed naming/association, native text exposure, refs, current Text
composition, constrained layout, and executable stories.

### Source interpretation

The five Label files identified in `spec/source.json` were actually consulted:
the shared skill and usage, and web accessibility, interaction, and tokens.
Their Git blob and normalized SHA-256 identities match the historical pinned
Marketplace/X3 provenance exactly; there are no recorded Label release-content
differences. Preserve those identities rather than refreshing or inventing
them. Shared/web consultation does not establish a native source surface.

Variants, marker visibility, and token choices are adopted from that evidence
through the existing local contract. Slots, refs, explicit native naming, and
native text measurement are adaptations to current FURN foundations. Browser
activation forwarding is not applicable. Native relationship semantics are
deferred; UIA/AX projection and speech remain unknown until verified.

The consulted RadioGroup skill/accessibility companion provides corroboration
for legend composition, not proof of native group naming. The coordinator
verified all cached files against the three immutable upstream plugin tree
inventories, including the RadioGroup companions. Runtime plugin envelopes are
not substituted for those canonical source identities.

## Public contract

### Variants and state ownership

`weight` accepts `regular` and `strong`, defaulting to `regular`. `size`
accepts `small`, `medium`, and `large`, defaulting to `medium`. `required`
and `disabled` default to `false`. These are externally supplied presentation
values, not self-driving controls: there are no default/change callback
triples, selected state, or interaction-state variants.

Disabled affects both text foregrounds without changing typography or marker
visibility. Required controls marker visibility without asserting that a native
control is required. The marker can therefore remain present while disabled.

### Slots and forwarding

The declared `root` is a native `View`. Its top-level props use
`PropsWithRefOf<typeof View>` and the existing `OwnedRootProps` pattern.
`children`, `role`, `accessibilityRole`, `focusable`, and `tabIndex` are component-owned.
Layout handlers, identifiers, compatible native props, and a View style remain
forwardable. A caller cannot turn the root into a keyboard target or override
its owned semantics through slot props.

`content` is a required slot of the package's theme-aware `Text`. It accepts
shorthand content, slot props, or a compatible `as` replacement. Omission
retains the donor's visible default, `Label`; that convenience is not an
adequate application-specific name. Root children cannot bypass this slot.

`requiredIndicator` is an optional `Text` slot. It is absent when `required`
is false; when true, omission gives `*`, a supplied slot replaces it, and
`null` explicitly suppresses it. Render `content` before `requiredIndicator`.
Slot replacements must remain non-interactive and preserve owned descendant
accessibility settings and compatible refs.

### Native name and composition

The implemented default is one accessible View root with
`accessibilityRole="text"` and `focusable=false`; both text slots are
decorative descendants. This intentionally reopens the donor's role-free
root: the historical repair and current package story/status precedents use
the native text role. Neither a JS role assignment nor a mock query proves
UIA Text or AX static-text exposure.

Resolve the root name from explicit `accessibilityLabel`, then an explicit
`aria-label` alias, then scalar content. Scalar extraction covers string or
number shorthand and string or number `content.children`; zero is valid.
Normalize the alias into the same native name rather than forwarding
conflicting aliases. Do not traverse React element trees or infer text from a
custom component. A custom replacement whose rendered text differs from its
scalar children needs an explicit name.

An empty/whitespace-only or unresolved name on an accessible Label requires
the repository-standard development warning. An explicitly empty name is not
silently replaced with default content. The required marker, including a
custom marker, is never appended to the derived name. Use trimmed validity
only for diagnostics; preserve the actual supplied string as the native name.

Retain `accessible=false` for a visual legend whose owner supplies the group
name. In that mode neither root nor text descendants are announced as a
separate Label; the owner must provide the corresponding native group/control
name. Do not reference this hidden legend as a proven native naming target.

### Refs and text styles

The top-level React 19 ref targets the declared View, not a Text, control, or
imperative focus facade. Each public Text slot can take its own Text ref.
Pass refs through the Framework Base slot/render path; preserve object refs,
callback refs, cleanup, detach, replacement, and compatible `as` forwarding.
Do not add `forwardRef`, `componentRef`, or a Label focus method.

Use current Text's phased native-root continuation, not an extra wrapper.
Apply Label typography/color after Text defaults and caller slot styles after
Label styles. Apply caller root style last. Keep theme-only factories
module-scoped and immutable. There is no fixed text/root height, default
truncation, synthetic baseline offset, or independent animation.

### Requirements

- **LBL-001:** Preserve the four documented axes/defaults and root children
  exclusion; public slot/type acceptance must match the declared native roots.
- **LBL-002:** Preserve content/marker ordering, default content and marker,
  conditional marker construction, custom marker, and explicit suppression.
- **LBL-003:** Preserve the typography, foreground, and gap bindings in
  `spec/tokens.yaml`, disabled color precedence, and caller-last style ordering.
- **LBL-004:** Reopen the accessible-root contract: one intended named text
  element, hidden text descendants, scalar/explicit-name precedence, alias
  normalization, and missing-name diagnostics. Native projection is a gate,
  not a conformance claim.
- **LBL-005:** Preserve non-interactive behavior: no focus target/ring,
  activation forwarding, press/hover state, motion, or disabled accessibility
  state authored by Label.
- **LBL-006:** Forward stable root/inner refs and native identifiers through
  current React 19 slots, including cleanup, detach, rerender, and compatible
  replacement. An identifier/ref is not proof of a naming relationship.
- **LBL-007:** Support RadioGroup's visual legend using `strong`/`medium`
  Label and its marker, including `accessible=false` when the owner supplies
  the name. Group naming, required semantics, selection, and navigation remain
  with RadioGroup; preserve access to each option.
- **LBL-008:** Use explicit names on the actual native control/group as the
  proposed portable naming path. Leave `accessibilityLabelledBy` and
  `aria-labelledby` announcement/precedence guarantees unclaimed until
  separately verified per renderer.
- **LBL-009:** Preserve native text scaling and unconstrained line metrics.
  Constrained long text must wrap without default clipping/truncation; marker
  layout and logical trailing order need RTL, multiline, and enlarged-text
  evidence on each claimed desktop endpoint.
- **LBL-010:** Replace donor legacy story plans with typed top-level named
  `wdio` cases. Demonstrate axes, naming, refs, disabled/required combinations,
  and constrained content; report endpoint pass/fail/skip and announcement
  evidence honestly.

## Platform behavior

The same API targets macOS Fabric, Windows Fabric, and Office Win32.
The `Windows, macOS` front-matter category is not qualification of these three
distinct renderers. No endpoint has been run for this recovery.

`nativeID` is passed to the root unchanged. Neither its presence nor a
consumer's `accessibilityLabelledBy` prop establishes a working UIA/AX
relationship. Label has no control target registry and does not set a name on
another component. Use one explicit naming path on the actual target unless a
native relation is qualified. On Input that target is the `textInput` slot,
not its structural View.

For a RadioGroup legend, reuse the same localized scalar string for visible
Label content and the group's explicit native name. This is a deliberate
native composition, not a fieldset/legend emulation or Label-to-each-Radio
association. Whether the group's container can expose that name without
collapsing options, and what Narrator/VoiceOver announces on entry, are
RadioGroup's separate native gates.

Disabled is visual on Label; the actual control owns disabled semantics.
Required is also visual on Label. Do not invent an
`accessibilityState.required` contract or promise that a hint is spoken.
The form/group owner must choose and verify its required-state communication.

## Divergences from Flex

- `label-activation-forwarding` (`not-applicable`): retain the reviewed
  omission of browser activation forwarding. Label has no press-to-focus
  behavior and does not synthesize a control activation.
- `disabled-color-transition` (`not-applicable`): retain immediate foreground
  changes; there is no animation to coordinate or suppress.
- `label-native-association` (`deferred`): replace the donor's unsupported
  cross-desktop relation guarantee with explicit target naming. Optional
  native relation semantics/precedence require source and endpoint evidence.
- `label-native-text-role` (`aligning`): propose the native text role on the
  accessible View rather than an unrelated ARIA role or the donor's role-free
  root. Independent pre-code review is complete; native projection evidence
  remains required.
- `label-group-legend` (`aligning`): the Label usage source limits general
  grouping use, while the consulted RadioGroup companion explicitly composes a
  Label legend. Permit that narrow visual reuse; the native group owns naming
  and all option semantics.
- `required-marker-layout` (`aligning`): retain a separate trailing Text
  sibling and token gap, not an inline punctuation run. Centered row layout
  does not guarantee attachment to the last word of multiline content.
  Verify the proposed multiline/RTL treatment without copying browser layout.

## Conformance

The independent coordinator reviewed the source identities, reopened native
role/name policy, visual-only legend mode, explicit target naming, ref
forwarding, token bindings, and separate marker layout on 2026-10-01.
Lifecycle is `implemented`; the following local types, stages, tests, and
stories now exist and correspond to the reviewed requirements. Conformance
retains the coordinator's reviewed contract and date, not a worker approval.
Runtime/type tests, shared export/story integration, and package/native
validation remain unrun or pending with the coordinator. Existing evidence
files do not imply native projection or screen-reader speech has passed.

| Requirement | Local evidence and remaining native gate                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| LBL-001     | `label.types.ts`, `label.types.test.ts`, `useLabel.ts`, `label.stories.tsx`                                     |
| LBL-002     | `useLabel.ts`, `renderLabel.tsx`, `label.test.tsx`                                                              |
| LBL-003     | `label.styles.ts`, `useLabelStyles.ts`, `label.test.tsx`                                                        |
| LBL-004     | `useLabel.ts`, `label.test.tsx`, `label.stories.tsx`                                                            |
| LBL-005     | `label.types.ts`, `useLabel.ts`, `label.test.tsx`, `label.stories.tsx`                                          |
| LBL-006     | `label.types.ts`, `label.types.test.ts`, `label.test.tsx`, `label.stories.tsx`                                  |
| LBL-007     | `label.types.test.ts`, `label.test.tsx`, `label.stories.tsx`; RadioGroup endpoint evidence belongs to its owner |
| LBL-008     | `label.test.tsx`, `label.stories.tsx`; renderer-specific relationship evidence remains unqualified              |
| LBL-009     | `label.styles.ts`, `label.test.tsx`, `label.stories.tsx` plus scoped native geometry/visual evidence            |
| LBL-010     | `label.stories.tsx` plus coordinator-owned story inclusion and endpoint reports                                 |

The native root role/name policy, alias normalization, visual-only legend mode,
marker layout, and association limits passed pre-code review. Before endpoint
acceptance, obtain actual native name/role, Tab exclusion, text-scale/layout,
identifier/ref, and control/group announcement evidence for every claimed
renderer. A passing contract checker only validates the local metadata shape.

`label.test.tsx` covers the 24 size/weight/required/disabled combinations,
name extraction/precedence and diagnostics, optional marker customization,
owned accessibility, theme/style precedence, forwarding and layout props,
distinct native refs, callback cleanup/replacement, compatible slot overrides,
and stage composition. `label.types.test.ts` records the public finite axes,
native ref types, slot compatibility, and excluded root APIs.

`label.stories.tsx` supplies scalar controls and executable native cases for
name/role, presentation changes, actual editor naming, Tab exclusion,
non-forwarded pointer activation, constrained LTR/RTL geometry, and ref
lifecycle. Native speech, required-state communication, enlarged system text,
and integrated RadioGroup announcements still need separate endpoint evidence.
