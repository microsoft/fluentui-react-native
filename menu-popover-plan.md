# Popover, Menu, MenuButton, and Dropdown implementation plan

**Status:** macOS prerequisite continuation, October 17, 2026. Section 13 records the renderer fixes and passing
Fabric/Paper native prerequisites; family/continuation, assistive-technology, and component-contract gates remain.
Section 12 preserves the October 16 Windows handoff and its delivered code,
unqualified native-input/macOS gates, repository-check failures, and per-platform next steps. The owner's D01-D14
and reviewed R1-R3 answers are confirmed; R1 approves
the Win32 close-and-return Tab interim, tracked with the other host follow-ups in #4384. This plan is not an approved
contract for any of the four new components: each still needs its normal pre-code contract gate.

**Baseline:** October 16, 2026; `microsoft/fluentui-react-native` commit
`e2092f9df3fd4fafc141c696ca0e49e690d69cd1`. Issue bodies were read in full. Their October 2 baseline predates the
native-core modernization merged in #4381; current source and dated qualification records take precedence over
stale infrastructure descriptions.

## 1. Outcome and scope

| Issue | Deliverable                                                                                                                                                                   | Dependency                                                                                                    |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| #4236 | Popover: styled, anchored, nonmodal hosting with a single visual type; controlled/uncontrolled open state; trigger, entry focus, dismissal, and native presentation lifecycle | Reviewed source contract and the native-core Callout additions in section 5                                   |
| #4232 | Menu: command collection of MenuItem/Divider children, navigation, type-ahead, actions, hover-open submenus up to two levels, and discoverable disabled rows                  | Popover; FocusZone; the MenuItem amendment; popup-family and focus-continuation work delivered by this effort |
| #4231 | MenuButton: Button-styled trigger (forwarded appearance/size) with an always-present static chevron and Menu behavior                                                         | Button and Menu                                                                                               |
| #4224 | Dropdown: button-semantics trigger with Input chrome, ListboxItem-based options, single/multiple selection, and private listbox subparts                                      | Popover; the Input focus amendment; a contextual ListboxItem option adapter with real option focus            |

The four issues explicitly exclude adding mobile support. **Every component ships on macOS Fabric, macOS Paper,
Windows Fabric, and Office Win32 together (D01)**; no platform-restricted release or platform-first milestone is
planned. Each Win32 gap is closed by a named JavaScript workaround or by a named native addition (section 5).
Windows Paper and Win32 Fabric are not supported endpoints. iOS/Android imports must remain safe, but these
components must not claim functioning mobile presentations.

Success means reviewed contracts, complete typed implementation pipelines, explicit exports, changesets,
runtime/type tests, executable stories, and actual native evidence on all four endpoints. A flat Menu may be an
internal milestone; it does **not** satisfy the full Menu issue while required submenu behavior remains outstanding.
Context-menu opening and point anchors are deferred to #4383 (D13). No legacy migration, Combobox/Select
implementation, generic overlay toolkit, or unrelated component API redesign is included.

## 2. Evidence and present constraints

**Observed** below means inspected source or a dated repository record, not native execution during this planning
session. **Proposed** behavior remains subject to contract review. **Confirmed** marks an owner decision (section 9).

1. All four higher-order components and their colocated contracts are absent from current main. Button, Input,
   MenuItem, ListboxItem, Divider, shared focus targets, and native-core Callout/FocusZone already exist. Reviewed
   historical Popover/Menu work is useful prior art, not delivered main or an approved port. [E01, E03, E04]
2. Modern native-core `/macos` and `/windows` previews provide Callout, FocusZone, and live view targets.
   Root/Win32 modern entrypoints do not provide these components; modern Win32 FocusZone commands throw.
   Win32 uses host-provided legacy registrations through `/legacy`. [E05, E06]
3. Current native-core records describe passing flat Callout/MenuComposition cases on Windows and both macOS
   renderers, plus narrower legacy Win32 cases. Those are primitive/composition baselines, not qualification of
   these four missing components. Windows native-core story discovery is restored; the blanket Callout exclusion
   in #4236 is stale. No baseline was rerun for this plan. [E01, E07]
4. Popup-family transactions and natural owner-relative Tab/restoration are not established by flat composition.
   #4377 tracks the native policy work, which this effort now implements for its consumers (D02). Modal containment
   is separate #4379 work. Native ownership topology alone supplies neither feature. [E05, E08]
5. MenuItem currently excludes disabled rows from focus eligibility (`focusable: isInteractive && !disabled`), and the
   shared pressable hook only registers enabled focus targets. ListboxItem deliberately forces button/pressed
   semantics and externally driven `selected`; it is not already a native listbox-option contract. Input's actual
   focusable/accessible element is a TextInput, not its structural View. These are composition gates, not details
   to overwrite through arbitrary slot props. [E04, E09, E17]
6. Accessibility needs native proof. Inspected RNW mappings omit several web-style role strings; ListboxItem's
   button/pressed projection does not establish SelectionItem. macOS Fabric has role/state projection limitations,
   including disabled/selected updates. Role strings, rendered state, and physical clicks do not establish
   UIA/AX actions or announcements. [E10, E11]
7. The components manifest declares native-core, but `src\AGENTS.md` still restricts production dependencies to
   React/React Native, Design, and Framework Base. **Confirmed (D02):** native-core becomes a relied-upon
   dependency; this effort amends that rule and the instructions that state it. [E01, E02]

### Flex authoring: pinned payload consultation

The repository's `flex-authoring` profile pins `flex-components`, `flex-system`, and `flex-tokens` to Marketplace
commit `206c4996205b027f4d806ac4ac7366f1f0ab0d5a`; the source lock identifies release `flex-1.5.0-206c4996` and
includes all four components. The checked-in drift report is dated August 31, 2026, not a fresh October source
audit. [E12]

The two independent planners could not reach the component payloads. After their reciprocal review, an
authorized internal GitHub account read the payloads directly, read-only, from the source lock's marketplace
repository at that exact commit. They were kept outside this worktree.

- **Identity verified:** the `components`, `system`, and `tokens` plugin tree SHAs equal the lock's recorded values,
  and all 15 MenuItem, ListboxItem, and Input file digests equal those already recorded by their reviewed
  contracts. Per-file digests for the four targets are in E15.
- **Surfaces:** each of the four skills has only shared (`SKILL.md`, `usage.md`) and `web` companions. There is no
  mobile or native-platform companion, so desktop behavior is a React Native adaptation of web guidance plus
  version-pinned platform evidence, never an implicit platform fallback.
- **Status:** this is a planning consultation, not contract review. Contract authors must re-read the payloads,
  record consulted surfaces, classify every claim, and pass the pre-code review gate. This plan paraphrases Flex
  direction; it reproduces no Flex prose, rationale, or token table, and names only FURN token keys from the
  public token map.

Use `agentic-component-authoring` plan mode, `agentic-component-contract-authoring` with the Flex/X3 adapter and
applicable composite evidence, the native-component overlay, and focused cross-component optimization guidance.
In the contract session:

- Re-read the four pinned component skills and the adjacent Button, Input, MenuItem, ListboxItem, and Divider
  contracts at the composition boundaries.
- Record immutable source identities/digests and actual consulted surfaces; write original React Native contracts.
  Do not copy private source bodies, lightly transformed prose, or private workflow records into this repository.
- Resolve authority per requirement: Flex for design intent; version-pinned native/renderer evidence for what the
  host actually does; V1 Win32 for observable compatibility, not implementation imports or a mobile baseline.
- Produce `SPEC.md`, `spec\source.json` schema 2, `spec\tokens.yaml`, `spec\accessibility.md`,
  `spec\interaction.md`, and `spec\usage.md` for each component. Track adopted/adapted/divergent/deferred/unknown
  claims, token gaps, requirement IDs, and planned evidence.
- Keep `contract-draft`, `review-required`, and null review date until explicit pre-code review. The components
  are catalog entries: do not bypass the gate with a fabricated skill or `local-foundation` source. [E02, E12]

The checker currently requires `platform: react-native (Windows, macOS)` frontmatter; document renderer and Win32
compatibility details in the contract body. Refresh local source reporting with
`report:spec-source-drift --offline --write` before checking newly added contracts. Authorized Flex identity
updates require an existing `SPEC.md`; source-refresh tooling never supplies review approval. [E12]

Reconcile PR #4308 and public branch commit `5f6e7af1252bcfe087dcd1672afaa4ceb7c5efbb` as historical prior art.
Their legacy APIs and native family additions are not current-main capabilities. Reuse requirement IDs only when
semantics are unchanged; re-derive contracts against current native-core instead of cherry-picking an obsolete host
protocol.

### Flex-derived contract inputs

These classifications feed contract review. **Adopt** keeps the Flex direction, **Adapt** keeps its intent through a
React Native or native mechanism, **Defer** records a divergence with a revisit trigger, and a decision ID marks
an item settled by the owner decisions in section 9.

**Popover**

| Flex direction (paraphrased)                                                                                                                | Proposed FURN treatment                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One visual type with no size or appearance axis. The surface is passive (visible or hidden) and owns no interaction states.                 | **Adopt.** No finite visual axis beyond placement; the trigger and content own interaction states.                                                                                                                                                                                      |
| An optional arrow, hidden by default, aimed at the trigger's center.                                                                        | **Defer** (D11): modern Callout draws none, and only the legacy Win32 host exposes one.                                                                                                                                                                                                 |
| Placement is chosen in code, centered on the trigger by default, flips on overflow, and must clamp to the viewport on both axes.            | **Adopt** as native requirements with default alignment `center`. Verify shift, flip, and clamp per renderer (#4375); no JavaScript positioning engine.                                                                                                                                 |
| A required content slot that may hold structured, interactive content.                                                                      | **Adopt.**                                                                                                                                                                                                                                                                              |
| Light dismissal by outside click and Escape is always available; Escape and explicit close return focus to the trigger.                     | **Adopt**, with the macOS trigger-eligibility adaptation in section 4.                                                                                                                                                                                                                  |
| On open, focus enters the first focusable content, or the container when none exists.                                                       | **Adopt** (D05) on every open, pointer or keyboard. Native-core exposes its focus services' existing `first` strategy through Callout, with an explicit focusable-container fallback.                                                                                                   |
| Tab may leave the surface at either end; closing at that boundary keeps the natural next focus.                                             | **Adapt** (D05): a separate native popup window cannot inherit the owner's tab order. Tab stays inside the popup with Escape as the exit until the owner-relative continuation this effort adds (#4377) is available on every platform; Popover then adopts the Flex boundary behavior. |
| Interactive content uses dialog semantics with a required name; the trigger exposes expanded, controls, and dialog has-popup relationships. | **Adapt** (D12): RNW maps no dialog role string, and has-popup and controls have no typed RNW/macOS property.                                                                                                                                                                           |
| A Popover must not be nested inside another Popover.                                                                                        | **Adopt** with a development diagnostic. Popover then needs no family transactions; Menu submenus are Menu-owned.                                                                                                                                                                       |
| A brief fade/scale entry and near-instant exit, instant under reduced motion; motion is marked pending.                                     | **Defer.** Native presentation is instant, which matches the reduced-motion behavior.                                                                                                                                                                                                   |

**Menu**

| Flex direction (paraphrased)                                                                                                                                                                                                              | Proposed FURN treatment                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A Popover filled only with MenuItem rows (list items and section headers) and Dividers; no variants.                                                                                                                                      | **Adopt** (D06). Bounded children with development diagnostics; no arbitrary content.                                                                                                            |
| Inherits the Popover surface but uses tighter padding, no gap between items, and a width set by the widest item rather than the trigger.                                                                                                  | **Adopt.** Padding `spacing.componentBase200`; item gap 0.                                                                                                                                       |
| Item focus visuals come from MenuItem.                                                                                                                                                                                                    | **Adopt** MenuItem's reviewed focus-visual policy.                                                                                                                                               |
| Arrows wrap; Home/End jump; Enter/Space activate; the inline-end arrow opens and enters a submenu; the inline-start arrow returns to its row; Escape closes to the trigger; first-character type-ahead; headers and dividers are skipped. | **Adopt.** Native FocusZone owns wrapping arrows; Menu owns macOS Home/End, RTL-aware submenu arrows, and type-ahead.                                                                            |
| Opening focuses the first item, or a previously selected item where applicable; focus goes back to the trigger on close.                                                                                                                  | **Adopt** for keyboard and accessibility opens. **Adapt** (D03) pointer opens: focus enters the menu without a highlighted row, following native menus (section 4).                              |
| Opening paths include click, keyboard shortcut, Enter/Space, and secondary click for context menus; closing paths include Escape, outside click, item selection, and tabbing out.                                                         | **Adopt** the trigger paths. **Defer** context-menu opening (secondary click, keyboard invocation, and point anchors) to #4383 (D13).                                                            |
| Usage requires dismissing on every non-submenu activation; interaction guidance limits close-on-selection to single-action menus.                                                                                                         | **Adopt** (D07): dismiss on every non-submenu activation, including checkable rows.                                                                                                              |
| At most two submenu levels.                                                                                                                                                                                                               | **Adopt** as a Flex-backed limit with a development diagnostic.                                                                                                                                  |
| Each submenu anchors a Popover to the row that opened it, aligned with that row's top edge, preferring the inline-end side, arrowless, offset by the Popover gap, and flipping or clamping like Popover.                                  | **Adopt.** A child Callout anchored to the row view, with RTL mapping and the native family transactions this effort adds (#4377).                                                               |
| The surface has menu semantics and a required name; the trigger exposes menu has-popup and expanded state.                                                                                                                                | **Adapt** (D12): `menu` is mapped on RNW and macOS Paper; Fabric needs evidence.                                                                                                                 |
| Hover-to-open submenus are not specified.                                                                                                                                                                                                 | **Add** (D07): hovering a submenu row opens it, and hovering away closes it, after platform-standard delays with pointer-travel tolerance; both behavior and timing are overridable (section 4). |
| Disabled rows may stay announced to assistive technology.                                                                                                                                                                                 | **Adopt** (D06): Menu rows announce their disabled state and refuse activation; they can stay focusable while disabled, by default on Windows and Win32 (section 4).                             |

**MenuButton**

| Flex direction (paraphrased)                                                                                                                                                                      | Proposed FURN treatment                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Forwards Button's four appearances (secondary by default), three sizes (medium by default), and interaction states; no selected or toggle axis.                                                   | **Adopt.** Reuse FURN `appearance` and `size`; exclude `selected`.                                                                                                                                                                                                                                                                                                           |
| Replaces Button's layout axis with an optional label and optional leading icon on one rounded chrome set; an icon-only trigger stays a rounded rectangle.                                         | **Adopt.** Exclude `shape` and `iconPosition`. Use Button's content-layout metrics for every label/icon combination rather than its icon-only padding branch, keeping icon-only accessible-name detection separate from layout selection. Warn when both label and icon are absent; icon-only triggers need an accessible name, and usage pairs them with a Tooltip (#4249). |
| A trailing down chevron is always present, cannot be replaced, does not change when open, follows the trigger foreground, and is sized 16/20/20 for small/medium/large.                           | **Adopt** as a private, nonreplaceable chevron rather than a public optional slot, using the new shared down-chevron icon source (D11).                                                                                                                                                                                                                                      |
| The open state is drawn with the pressed chrome.                                                                                                                                                  | **Adopt.** Expanded maps to the pressed visual in state precedence.                                                                                                                                                                                                                                                                                                          |
| Its menu is a flat action list: no section-header rows and no nested MenuButtons inside rows.                                                                                                     | **Adopt** with development diagnostics; submenus use MenuItem's chevron.                                                                                                                                                                                                                                                                                                     |
| Enter, Space, and Down open to the first item; Up opens to the last. Activation, Escape, outside click, and Shift+Tab return focus to the trigger; Tab closes and moves forward past the trigger. | **Adopt** (D07). Tab-forward uses the native owner-window continuation this effort adds (#4377) and is required for release on every platform.                                                                                                                                                                                                                               |
| Opens below, start-aligned, flipping upward; width follows content; no arrow.                                                                                                                     | **Adopt** `bottom`/`start` placement.                                                                                                                                                                                                                                                                                                                                        |
| The trigger exposes button semantics with menu has-popup, expanded, and controls relationships.                                                                                                   | **Adapt** (D12): no typed has-popup or controls property on RNW/macOS.                                                                                                                                                                                                                                                                                                       |
| Only one menu is open at a time through shared light dismissal.                                                                                                                                   | **Adopt.** Qualify that an outside click on another trigger both dismisses and activates it.                                                                                                                                                                                                                                                                                 |
| The label never mirrors the chosen action; unavailable actions are preferably hidden rather than disabled.                                                                                        | **Adopt** as usage guidance.                                                                                                                                                                                                                                                                                                                                                 |

**Dropdown**

| Flex direction (paraphrased)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Proposed FURN treatment                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The trigger is a non-editable, button-like control with combobox semantics that borrows only Input's visual chrome; Input's editing, caret, and read-only behavior are not used.                                                                                                                                                                                                                                                                                                                                         | **Adopt** (D08). A Pressable trigger reusing Input's chrome resolver, not a TextInput.                                                                                                                                                                 |
| Forwards Input's two variants (outline by default) and three sizes; adds single or multiple selection (single by default), error, and disabled; read-only is not modeled.                                                                                                                                                                                                                                                                                                                                                | **Adopt.** FURN `variant`, `size`, selection mode, `error`, and `disabled`; exclude `readOnly`.                                                                                                                                                        |
| Anatomy: optional leading slot, value or placeholder text, trailing chevron, a role-less popup surface, an inner listbox, and ListboxItem rows (checkmark in single mode, presentational checkbox in multiple mode).                                                                                                                                                                                                                                                                                                     | **Adopt** (D08). The listbox host, groups, and value text stay private subparts. **Defer** the clear-selection affordance and the tag-strip display.                                                                                                   |
| The chevron rotates when open and resolves its foreground independently: secondary at ordinary rest, primary when focused or in error, and disabled overriding both; sized 16/20/24.                                                                                                                                                                                                                                                                                                                                     | **Adopt** `color.foregroundNeutralSecondary` (rest), `color.foregroundNeutralPrimary` (focus and error), and `color.foregroundNeutralDisabled` (disabled); rotation is instant under reduced motion.                                                   |
| The trigger inherits Input's variant-specific focus treatment (outline: the shared two-part ring over a softened boundary; underline: a thicker bottom edge in the focus color) and shows no other outline.                                                                                                                                                                                                                                                                                                              | **Adopt** (D11). This effort amends Input to implement the variant-specific treatment, resolving its deferred `input-focus-indicator` divergence, and Dropdown reuses it so sibling fields match.                                                      |
| Multiple mode shows comma-separated labels and falls back to a count summary when they do not fit; the accessible name still carries the selected labels.                                                                                                                                                                                                                                                                                                                                                                | **Adopt.** Measure the available width for the summary fallback.                                                                                                                                                                                       |
| Focus stays on the trigger while open; the active option is virtual and the parent paints its ring, so the trigger's focus indication and the active option's ring are visible together.                                                                                                                                                                                                                                                                                                                                 | **Adapt** (D09): real focus moves into the options, recorded as a Dropdown divergence consistent with ListboxItem's accepted real-focus divergence. The trigger keeps its focused visual while expanded so the paired indication remains.              |
| Closed: Enter/Space open on the selected option (in multiple mode, the most recently toggled one) or else the first; Down/Up open on the first/last option, or on the selected one; an optional setting may open with no active option. Open: arrows stop at the ends; Home/End jump; Enter/Space commit and close (single) or toggle and stay open (multiple); Escape closes without undoing committed toggles; Tab and Shift+Tab close and move to the next or previous focusable element. No type-ahead is specified. | **Adopt.** Use a stop-at-edge arrow boundary; track the most recently toggled key separately from committed membership, with an explicit fallback when it is unavailable. Tab and Shift+Tab use the native owner-window continuation this effort adds. |
| The general usage guidance lists Tab among closures that return focus to the trigger, while the keyboard guidance sends Tab and Shift+Tab onward.                                                                                                                                                                                                                                                                                                                                                                        | **Adapt.** The keyboard-specific guidance governs sequential navigation; record that resolution in the contract.                                                                                                                                       |
| The popup is never narrower than the trigger, is viewport-bounded in height with internal scrolling, opens start-aligned below with an upward flip, and is minimally padded and arrowless.                                                                                                                                                                                                                                                                                                                               | **Adopt.** Measure the trigger width for the content minimum; native anchoring does not size content.                                                                                                                                                  |
| A disabled Dropdown never opens, including through programmatic opening.                                                                                                                                                                                                                                                                                                                                                                                                                                                 | **Adopt.** Guard presentation, not only trigger activation.                                                                                                                                                                                            |
| Whether opening one Dropdown closes another is a product decision.                                                                                                                                                                                                                                                                                                                                                                                                                                                       | **Adopt** (D10): no component-enforced closing; shared light dismissal closes an open Dropdown when another control is used.                                                                                                                           |

**Resolved by Flex:** the two-level submenu limit, Dropdown's button-semantics trigger with Input chrome, the absent
Dropdown read-only state, and MenuButton's prop exclusions. **Resolved by the owner decisions:** Dropdown's real
option focus, Popover entry focus and its Tab boundary, Tab continuation as native work in this effort, hover-open
submenus, discoverable disabled rows, the context-menu deferral to #4383, and the outside-click focus adaptation.

## 3. Architecture and ownership

```text
Owner decisions + pinned sources + reviewed contracts
                         |
  native-core additions (entry focus, dismissal reasons, family transactions,
  owner-relative Tab, hover timing, Win32 route) + framework-base disabled-focusable
  support + MenuItem, Input, and ListboxItem amendments
                         |
                   Popover #4236
                   /           \
             Menu #4232       Dropdown #4224
                 |            + Pressable trigger, Input chrome
          MenuButton #4231     + ListboxItem option adapter
             + Button
```

Popover owns popup lifetime and hosting policy. Menu and Dropdown add different collection semantics; Dropdown
must not inherit command-menu selection behavior. MenuButton delegates to Menu and adds trigger presentation.
One implementation owner/context handles each component's complete types/state/styles/render pipeline.

| Responsibility                                                                                                                 | Location and invariant                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Native geometry, ownership, readiness, focus confirmation, popup transactions, dismissal reasons, platform timing, AX/UIA gaps | Native-core (a relied-upon dependency, D02) and its host/renderer adapters. Modern APIs are experimental and may change; `/legacy` APIs stay stable. Native-core never depends on components or Design |
| Ordinary focus targets, activation, disabled-focusable eligibility, controlled state, generic action transport                 | Framework Base; extend only demonstrated shared non-styling capabilities                                                                                                                               |
| Theme/token styling utilities                                                                                                  | Design; no popup/selection state in theme caches                                                                                                                                                       |
| Popover lifecycle, Menu policy, Dropdown selection, MenuButton presentation                                                    | Their higher-order component directories                                                                                                                                                               |
| Repeated private platform binding or collection helpers                                                                        | `components\src\common`, only where reuse is demonstrated; no new public toolkit                                                                                                                       |

**Boundary decision (D02, confirmed):** components import native-core's public platform entrypoints from
platform-resolved files: `/macos`, `/windows`, and the Win32 route in section 5. Do not import internals or launder
the dependency through Framework Base, and keep fork imports in platform files. Components apply theming, such as
`RootInputBoundary`, inside the Callout attachment View, so native-core stays free of Design. Amend the
source-boundary rules in `packages\agentic\components\src\AGENTS.md` and the package `AGENTS.md`, remove the Knip
ignore once production imports exist, and run `yarn check-agent-instructions`.

**Native defaults (D03, confirmed):** every behavior starts from its native or platform default (dismissal, focus
restoration, navigation, and hover timing). A component overrides a default only through an override its contract
names, and native-core implements such overrides natively rather than through JavaScript vetoes.

Reuse existing pipelines and root exports under component-qualified unstable names. Flex specifies type-ahead for
Menu only, so keep the matcher Menu-local unless the Dropdown contract adds type-ahead. Do not add a public
OverlayManager, `useOverlay` framework, or process-global focus registry. Add a TurboModule only if section 5
shows a non-view platform query cannot be served by the view-bound native components.

### Component contract sketches

Names below follow the confirmed decisions; final spellings are ratified in contract review.

| Component  | Public contract and composition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Popover    | `open` / `defaultOpen` / `onOpenChange(open, data)`, where `data` carries a reduced reason (D03); a trigger slot with its own ref, or an external-trigger binding for composing components, and no child cloning (D04); required content slot; private surface; placement side/alignment (centered by default); view anchoring only, with rect and point anchors left to native-core and #4383; nonmodal; entry focus on every open (D05). No finite visual axis; the arrow is deferred; nesting is diagnosed. A stable structural View root `ref`, plus distinct trigger and content refs; the native presentation handle stays private. |
| Menu       | Popover hosting with Menu padding; bounded MenuItem/Divider children registered through a context-aware MenuItem amendment that adds a stable identity and type-ahead text (D06); wrapping native arrow navigation; Home/End/type-ahead; width from the widest item; at most two submenu levels with one active branch; hover-open submenus with platform-default timing and overrides (D07); disabled rows announced and, by default on Windows and Win32, focusable (D06); close on every non-submenu activation; action/check/radio state separate from open state. No context-menu opening (#4383).                                   |
| MenuButton | Reuse Button's state/style/focus pipeline, `appearance`, and `size`, with one actual Pressable. Exclude `selected`, `shape`, and `iconPosition`. Optional label and leading icon; a private, always-present static down chevron from the shared icon sources (D11); expanded draws pressed chrome. Forward Menu's open triple to its single owner through the external-trigger binding; its menu is a flat list without section headers.                                                                                                                                                                                                  |
| Dropdown   | Pressable trigger with combobox semantics and Input chrome (D08); `variant`, `size`, `error`, `disabled` (no `readOnly`); `selectedOptions` / `defaultSelectedOptions` / `onSelectedOptionsChange` with stable string keys and `multiselect` (D10); optional leading slot; `placeholder` and value display; rotating down chevron. Real option focus with an open-state trigger emphasis (D09). Separate open, active option, committed selection, and display text. The listbox host, groups, and value text are private subparts.                                                                                                       |

**Dropdown trigger (D08, confirmed):** the trigger is a non-editable control with combobox semantics that borrows
only Input's chrome. Build it as a Pressable that reuses Input's chrome resolver (`getInputResolvedStyles`),
size/variant/error/disabled bindings, state precedence, and the amended focus treatment (D11), without Input's
TextInput, caret, or read-only behavior. Do not realize it through an unreviewed TextInput substitution or an
incompatible slot replacement, and do not invent an editable Combobox, a general field toolkit, or new public
Option/Listbox catalog entries.

**Dropdown options (D09/D10, confirmed):** options are ListboxItem children carrying a new optional `value` key.
Inside a Dropdown context, a private adapter over ListboxItem's pipeline supplies option semantics, registration,
selection state, and position in set; standalone ListboxItem behavior is unchanged. React `key` and rendered labels
are not identities, and a caller role override cannot establish native selection semantics. Single mode accepts at
most one key, with a development diagnostic otherwise.

**Ref layout (D04, confirmed):** Popover and Dropdown expose a stable structural View root, with distinct trigger
and content refs; MenuButton exposes its actual Button Pressable root. Content refs are null while closed.

**Dropdown behavior (D10, confirmed):** follow the Flex keyboard and commit model in section 2: open on the selected
option (the most recently toggled one in multiple mode) or else the first, use first/last for Down/Up, stop arrows
at the ends, commit and close in single mode, toggle and stay open in multiple mode, and close without rollback on
Escape. Navigation changes the active option, never committed selection. Multiple mode displays labels with a count
fallback. There is no Apply/Cancel draft model and no component-enforced closing of other Dropdowns.

**Dropdown focus model (D09, confirmed):** real focus moves into the options, recorded as an intentional Dropdown
divergence from Flex's trigger-retained virtual focus and consistent with ListboxItem's accepted
`listbox-item-native-focus-model` divergence. Assistive technology reads the focused native row; Escape uses the
native popup path; Tab and Shift+Tab use the owner-relative continuation this effort adds. Because the trigger blurs
while open, it keeps its focused visual as an expanded-state style (not a native focus ring), preserving Flex's
paired indication. The virtual-focus alternative was not chosen: it would need a nonfocusable parent-painted
ListboxItem state, a new native active-option projection for announcements, passive-popup deactivation handling
(#4375), and a macOS trigger that holds first responder after pointer opens.

Each consumer chooses its entry focus: generic Popover enters its first content or container, Menu supplies its
opening item, and Dropdown targets its opening option.

## 4. Overlay and focus lifecycle

Use one generation-fenced lifecycle owner:

```text
closed -> waiting-for-live-anchor -> presenting -> positioned-ready -> closing -> closed
```

Requested `open`, actual native presence, confirmed child focus, and the presentation token are separate state.

**Lifecycle model (D03, confirmed):** native presence is authoritative and controlled `open` is a request. Native
code performs light dismissal immediately and then reports it; a controlled `open=true` that native dismissed stays
closed (latched) until the caller sets `false` then `true`, or a new presentation key rearms it. The trigger's
expanded state always reflects actual presence. A vetoable protocol is rejected: it would need a native-to-JavaScript
round trip before every dismissal, duplicate policy in three native hosts, and race the platform's own dismissal.
Behaviors a consumer must change are added as native overrides (for example, dismissal policies that the legacy
Win32 host already supports) and exposed only where a contract names them.

**Event data (D03, confirmed):** the native boundary reports truthful detail and the component API reduces it.

| Layer                                                   | Data                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native-core Callout dismissal (experimental modern API) | Split today's `native-light-dismiss` into the causes each platform can actually observe, such as Escape, outside pointer, application or window deactivation, and Tab exit, alongside `programmatic`, `anchor-lost`, and `host-detached`. Report the unclassified `native-light-dismiss` whenever a host cannot tell causes apart; never guess. |
| Component `onOpenChange(open, data)`                    | A reduced `data.reason`: the trigger toggled it, it was dismissed (any light-dismiss cause, anchor loss, or detachment), or a contained action closed it (a Menu item or a single-mode Dropdown commit). Native detail stays internal for focus policy, and the data object can grow without breaking callers.                                  |

Do not silently generate presentation keys to defeat light dismissal.

Implementation requirements:

- Bind current anchor/focus targets at attachment/commit; handle detach, ref replacement, callback cleanup, and
  stale generations. A mutable consumer ref alone is not a live subscription.
- Supply hook-driving Callout props (`ref`, `open`, `presentationKey`, `anchor`) and FocusZone
  `commandsRef`/`defaultTarget` during the phased slot's **first phase**, not only render-time JSX.
- Keep Callout's own non-collapsible attachment View: its `content` accepts View props/ref, not an arbitrary
  replaceable component slot. Place the existing scene's `RootInputBoundary` inside that View; do not replace the
  attachment host with it. Specify separately which View receives surface styles and consumer content refs.
  Preserve theme and do not add per-component modality trackers.
- Wait for the current presentation's native readiness and committed eligible child before focusing. Ready means
  positioned/attached, not focused. Inspect confirmed/refused/stale/cancelled/unsupported/timed-out results;
  never use fixed delays or interpret a void JS `focus()` as success.
- A refused or timed-out focus request does not prove focus remained on the trigger: native window activation may
  already have occurred. Observe actual focus/window outcome before recovery. Revalidate attachment, eligibility,
  current presentation, active owner window and superseding focus moves after caller callbacks/native close;
  a cached "focus was inside" flag or `restore` intent does not provide those guards.
- Cancel timers, pending focus, subscriptions, and stale open work on close, anchor loss, replacement, and teardown.
  Disabled triggers block opening, not closing or native resource cleanup.
- A press on the trigger while its popup is open must close it, not close and immediately reopen it: light
  dismissal and the trigger press can both fire. Snapshot the open state at the trigger's press-in and do not reopen
  a popup that was open, or was dismissed between press-in and press. Use no timers, and qualify the event order on
  every platform (the Win32 route lists the host fallback).
- Compose native actions, caller handlers, keyboard activation, and dismissal notifications exactly once. Eventless
  native invocation must not fabricate a pointer event.

### Restoration and key ownership

| Cause                                  | Required policy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Keyboard/accessibility open            | After native readiness, confirm focus on the component's entry target: Popover's first focusable content or focusable container; Menu's first item (MenuButton's Up key targets the last item; a previously selected item may apply); Dropdown's selected or first option (D09).                                                                                                                                                                                                                                               |
| Pointer open                           | Popover enters its content on every open, pointer included (D05). Menu follows the native convention (D03): focus enters the menu without a highlighted row, so the first Down arrow selects the first row, as V1 does on Win32. Dropdown focuses its selected or first option, as native select lists do. Record the Menu choice as an adaptation of Flex's first-item focus. Because AppKit keeps the previous responder on pointer press, macOS triggers use `pointerFocus: 'always'` where a later return must reach them. |
| Accepted terminal action               | Commit once; close the intended popup family; return focus to a live, eligible trigger (Flex for Menu, MenuButton, and single-mode Dropdown).                                                                                                                                                                                                                                                                                                                                                                                  |
| Deepest submenu Escape/back arrow      | Close that branch and restore its opener row in the parent, not the root trigger.                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Root Escape                            | Close root and descendants, then return to the trigger under the guarded policy.                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Outside pointer input                  | **D14 (confirmed):** if the outside input already focused another eligible control, keep it; otherwise return to the trigger (Menu, MenuButton, and Dropdown; generic Popover only dismisses). Never steal focus back from a newly focused control during cleanup.                                                                                                                                                                                                                                                             |
| Tab/Shift+Tab                          | Per component, as in the matrix below. Moving past the trigger uses the native owner-relative continuation this effort adds; no synthetic second Tab and no cycling in a closing popup.                                                                                                                                                                                                                                                                                                                                        |
| App deactivation, anchor loss, unmount | Cancel/close without reactivating another window or reviving a stale target.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

When a macOS trigger is not focus-eligible (keyboard navigation disabled), "return to the trigger" falls back to the
native previous-responder restoration; record the system setting with every run.

**Per-component keyboard and close behavior (Flex direction, adapted)**

| Behavior        | Popover                                                                         | Menu (standalone trigger)                                                          | MenuButton                                  | Dropdown                                                         |
| --------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------- |
| Opening keys    | Trigger activation                                                              | Enter/Space; context-menu opening deferred (#4383)                                 | Enter/Space/Down: first item; Up: last item | Enter/Space: selected or first; Down/Up: first/last, or selected |
| Arrow boundary  | Content-defined                                                                 | Wrap                                                                               | Wrap (Menu)                                 | Stop at the ends                                                 |
| Home/End        | Content-defined                                                                 | First/last item                                                                    | First/last item                             | First/last option                                                |
| Type-ahead      | None                                                                            | First character                                                                    | Through Menu                                | Not specified                                                    |
| Pointer hover   | None                                                                            | The hovered row becomes active; a submenu row opens after the platform delay (D07) | Through Menu                                | The hovered option becomes active                                |
| Escape          | Close; return to trigger                                                        | Close; return to trigger                                                           | Close; return to trigger                    | Close; trigger regains focus; no rollback                        |
| Tab             | Stays inside until continuation is available, then closes at the boundary (D05) | Close; return to trigger                                                           | Close; move past the trigger                | Close; next focusable element                                    |
| Shift+Tab       | Same as Tab, toward the previous element (D05)                                  | Close; return to trigger                                                           | Close; return to trigger                    | Close; previous focusable element                                |
| Item activation | None                                                                            | Non-submenu item: close; return to trigger                                         | Close; return to trigger                    | Single: commit and close; multiple: toggle and stay open         |
| Disabled item   | Not applicable                                                                  | Announced; activation refused; focusable by default on Windows and Win32 (D06)     | Through Menu                                | Not focusable (ListboxItem default) unless its contract changes  |
| Outside click   | Close                                                                           | Close; return to trigger (D14)                                                     | Close; return to trigger (D14)              | Close; return to trigger (D14)                                   |

Rows that move focus past the trigger (MenuButton Tab; Dropdown Tab/Shift+Tab; Popover's boundary once enabled)
use native continuation: after the popup closes, focus moves to the owner window's next or previous tab stop
relative to the trigger (the AppKit key-view loop; Windows island focus navigation). This effort implements that
continuation in native-core for macOS and Windows (#4377 scope). **R1 release exception:** on Win32, the owner
approved closing and returning to the live trigger instead of continuing past it. Track eventual host continuation
in #4384; do not synthesize another Tab or require caller-supplied neighbor targets. References to native Tab
continuation in the component tables use this explicit Win32 exception. Popover's D05 containment interim is unchanged.

One executor reconciles native restoration with component policy. Native owner restoration may mean the previous
responder, not the trigger. Focus policy reads the truthful native dismissal cause (D03); where a host reports only
an unclassified light dismissal, policy uses the D14 rule rather than a guessed cause.

Use native vertical FocusZone for Up/Down with `arrowBoundary="wrap"` for Menu and `"stop"` for a real-focus
Dropdown. Windows handles Home/End natively; macOS needs component policy issuing confirmed first/last requests.
Win32 follows the route in section 5. Components own printable type-ahead (Menu only, per Flex) and logical
submenu arrows, with RTL, modifiers, IME, and editable-child rules. Pressable owns Enter/Space activation: macOS
keydown versus Windows/Win32 keyup.

**Do not use `direction="none"` as a supposedly inert popup focus wrapper:** Windows still handles Home/End and Tab
independently. Flex requires Popover's entry focus to reach the first focusable content, so expose the native
services' existing `first`/`last` strategies through Callout's `requestFocus` (a reviewed native-core schema,
adapter, and codegen change), and designate a focusable content container as the explicit fallback target.

Nested Menu acceptance needs #4377's relevant family/continuation subset, which this effort implements:
generation-scoped parent/opener identity, sibling replacement, deepest close, ancestor input, whole-family action
close, one restoration executor, and cancellation of reentrant/racing operations, within Flex's two-level limit.
Source-level owner relationships differ between macOS and Windows; do not implement nested policy as independent
React booleans plus unmount cleanup.

### Hover-open submenus (D07, confirmed)

- Hovering a submenu row opens its submenu, and moving to another row closes it, after platform-standard delays.
  Mouse events carry no screen coordinates on Win32 or macOS, so JavaScript cannot track pointer travel across popup
  windows. Delay-only switching matches the Windows and Win32 convention. macOS menus also tolerate pointer travel
  toward an open submenu, so native-core adds a submenu-intent signal from the macOS popup window; until it lands,
  macOS uses a delay-only approximation recorded as interim.
- Defaults come from the platform. Windows reads the user's menu show delay natively (`SPI_GETMENUSHOWDELAY`, not the
  general mouse-hover time); its shipped default is commonly documented as 400 ms. Win32 uses the same setting once
  the host exposes it and falls back to that default until then. AppKit exposes no public submenu-delay setting, so
  P0 qualifies a macOS default against native menu behavior. For comparison, V1 hard-coded 100 ms on macOS and
  500 ms elsewhere, plus a 500 ms hover-out close, an uncancelled hover-in timer, and a 150 ms reopen guard; those
  are evidence, not targets.
- The Menu contract names the overrides: disable hover opening, or replace the open and close delays. Hover never
  opens the root menu from its trigger.
- The hovered row becomes the active row (hot-tracking), as in native menus and V1 on Win32, and its focus visual
  follows the scene's input modality. Keyboard navigation after hovering continues from that row. Leaving a row never
  blurs focus into nothing.
- Timers live in one owner per menu family, are cancelled on close, reopen, and unmount, and never fire into a stale
  presentation. Touch and pen input do not open submenus by hover.
- Native-core supplies the settings with the parent popup's readiness or a settings event from its mounted
  Callout/FocusZone integration, before the first submenu hover, and refreshes them when they change. A TurboModule
  (#4380) is warranted only if a consumer needs them without a mounted view; hover-opening a root menu would be one,
  and it is out of scope.

### Discoverable disabled rows (D06, confirmed)

- Add an opt-in disabled-focusable capability to Framework Base's focusable pressable: the native target stays
  focus-eligible and registered while disabled, the accessibility state reports disabled, and every activation path
  (pointer, Enter/Space, accessibility action) is refused. The default stays unchanged for all other consumers.
- Amend MenuItem to expose the capability (final prop name in contract review; Fluent UI's `disabledFocusable`
  naming is the candidate). Inside a Menu, rows use it by default where the platform convention calls for it (below)
  so screen readers find disabled commands; standalone MenuItem keeps its current behavior unless the prop is set.
  Its focus visual remains visible on disabled rows that hold focus.
- Native FocusZone eligibility must admit these View-backed rows. Source suggests it already does: Windows reads the
  view's `focusable` prop, and macOS checks first-responder acceptance. Change native code only if qualification
  fails, and keep macOS's rejection of disabled native controls. Type-ahead may land on disabled rows, and Home/End
  target the first and last focusable rows whether or not they are disabled.
- Platform adaptation: React Native macOS's Pressable turns focusability off whenever `disabled` is set. On macOS,
  MenuItem therefore keeps the accessibility-disabled state and refuses every activation path without passing
  Pressable's native `disabled` prop (passing `disabled={false}` would clear the disabled state). Windows Fabric and
  Win32 keep `focusable` independent of `disabled`. Fix macOS Fabric's disabled-state projection separately (D12).
- Per-platform default (recommended; confirm in section 9): Menu rows are focusable while disabled by default on
  Windows and Win32, matching their native menus, V1, and Narrator's reliance on focus. On macOS, AppKit menus do not
  keyboard-select disabled items while VoiceOver still reaches them, so the capability stays opt-in there and
  discoverability comes from fixing macOS Fabric's disabled-state projection. P0 verifies both against native menus,
  Narrator, and VoiceOver.

## 5. macOS, Windows, and Win32 handling

| Concern                 | macOS Paper and Fabric                                                                                                             | Windows Fabric                                                                                                                 | Office Win32 compatibility                                                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native route            | Modern `/macos` facade; shared Swift/AppKit behavior with separate bridge/component-view adapters                                  | Modern `/windows` facade; Composition popup island and native FocusZone                                                        | New experimental native-core Win32 adapter over the host's `RCTCallout`/`RCTFocusZone`; `/legacy` unchanged                                                                        |
| Host baseline inspected | RNmacOS 0.81.9; qualify both renderers independently                                                                               | RNW 0.81.35; no package-owned Windows Paper lane                                                                               | RN Win32 0.81.9; REX 0.81.1; no app-owned Win32 native build lane                                                                                                                  |
| Window/input            | Owned child NSWindow; first responder/field editor and app key-window conventions                                                  | Owned popup island; native key/pointer dismissal and owner-island restoration                                                  | Host-defined behavior must be observed, not inferred from declarations                                                                                                             |
| Placement               | AppKit coordinate conversion and bounds/window observation; test backing scale and multiple screens                                | Current placement sums frames; scroll offsets/transforms, RTL, non-100% DPI and monitor origins need #4375 qualification/fixes | Legacy placement props through the Win32 adapter; qualify DPI, scrolling, and monitor origins, and fix defects in the host                                                         |
| Focus/navigation        | Geometric navigation; component Home/End; native rings by default; record Keyboard navigation settings                             | Linear navigation and native Home/End; native rings by default; confirm focus operations                                       | Host FocusZone plus component Home/End and type-ahead on `nativeEvent.key`; custom scene-modality rings by default                                                                 |
| Focus at presentation   | The modern popup is ordered front without becoming key unless initial focus is requested, so the owner window keeps keyboard input | The modern presentation does not move focus; explicit operations confirm focus                                                 | `setInitialFocus`, `RCTFocusTrapZone` first focus, or `focusWindow()` plus a confirmed row focus, as the Win32 route describes                                                     |
| Dismissal/deactivation  | AppKit cancellation and outside monitor; qualify nested family behavior on both renderers                                          | Application deactivation dismisses only presentations that hold focus; qualify #4375 passive-popup cases and nested ownership  | Host light dismissal reported as unclassified; JavaScript owns Escape so it can report it truthfully                                                                               |
| Accessibility           | Separate Paper/Fabric role, state, AX action and VoiceOver evidence; Fabric projection gaps are release gates                      | Source-check mapped roles and UIA patterns; test Debug as well as Release                                                      | Win32-specific role vocabulary (`menuitem` with `checked`; `list` and `listitem` for Dropdown); title-case action declarations are not dispatch proof, so invoke real UIA patterns |
| Native changes          | Swift/shared services first; thin renderer glue; CocoaPods-module plus Office bridging-header checks                               | Existing native-core C++/WinRT views/services, UI dispatcher, generated bindings and packaging                                 | Office/REX host additions listed in the Win32 route, implemented and released by the host owners and enabled only after capability/version checks                                  |

### Native reuse/addition decisions

| Capability                                            | Reuse first                                                                                                       | Add or change only after this gate                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anchoring, readiness, placement, explicit operations  | Existing Callout and live view-target APIs                                                                        | Extend the experimental modern schema and adapters where a consumer needs it (D02); keep `/legacy` stable. Legacy Windows `focusWindow`/`blurWindow` stubs are not the modern confirmed-focus path.                                                                                                                                                                                                                                               |
| Popover entry focus (D05)                             | The macOS and Windows focus services already implement `first`/`last` strategies                                  | Add the strategy to Callout's `requestFocus` with schema, adapter, codegen, and Paper/Fabric parity; designate a focusable content container as the fallback target.                                                                                                                                                                                                                                                                              |
| Collection focus and disabled rows (D06)              | Existing FocusZone plus framework target bindings                                                                 | Verify that native eligibility admits focusable disabled View-backed rows (source suggests it does) and change native code only if qualification fails; keep rejecting disabled native controls. Never add a second competing arrow-navigation loop. Coordinate #4374.                                                                                                                                                                            |
| Family close, owner-relative Tab, guarded restoration | Existing owner topology as input, not complete policy                                                             | Implement the #4377 transaction, event, and continuation subset in native-core for macOS and Windows, plus the Win32 route below. Required by Menu submenus, MenuButton and Dropdown Tab, and Popover's eventual boundary behavior.                                                                                                                                                                                                               |
| Truthful dismissal reasons (D03)                      | The current reason set (`native-light-dismiss`, `programmatic`, `anchor-lost`, `host-detached`)                   | Split light dismissal into the causes each platform observes. macOS can distinguish Escape (`cancelOperation`), outside pointer (its event monitor), and application deactivation; Windows can distinguish its Escape handler, its outside-pointer monitor, and an added activation observation. Windows App SDK 1.8's light-dismiss event exposes no cause, so instrument the known native branches and keep an unclassified value for the rest. |
| Hover timing (D07)                                    | V1's per-platform JavaScript constants as evidence only                                                           | Read the Windows system menu show delay natively and surface it through mounted native-core views; qualify a macOS default in P0; use the Win32 route below.                                                                                                                                                                                                                                                                                      |
| Geometry/fit/surface appearance                       | Native positioning plus bounded content/scroll styles                                                             | Fix scroll/transform/DPI gaps natively under #4375 as part of this effort. Decide work-area fit, vibrancy/material, shadow and radius ownership; JS max-height alone does not guarantee fit. A Dropdown popup's minimum width comes from measuring the trigger, not from native anchoring.                                                                                                                                                        |
| Arrow and motion                                      | None in the modern Callout                                                                                        | Deferred divergences (D11).                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Accessibility (D12)                                   | Existing native mappings and the shared action resolver                                                           | Add source-correct expand/collapse and select/add/remove transport. Where a renderer cannot project a required role or state, make a narrow, qualified fix in native-core or upstream in the renderer; never fake semantics with value text.                                                                                                                                                                                                      |
| Win32 route (D01)                                     | The host's legacy views through the experimental native-core Win32 adapter, with the JavaScript workarounds below | The Office/REX host additions below; they are release dependencies because all platforms ship together.                                                                                                                                                                                                                                                                                                                                           |
| Modal, named/text anchors, system services            | No implied capability                                                                                             | Modal containment #4379 and text-fragment anchors #4378 are separate scope. Named anchors are host-specific, not a modern common guarantee. Platform menu settings come from native code surfaced through mounted native-core views; add a TurboModule (#4380) only if a consumer needs settings without a mounted view.                                                                                                                          |

**OS-native controls (D12, confirmed):** do not substitute NSMenu, NSComboBox, or Windows native flyout or selection
controls. The existing macOS native MenuButton precedent is Paper-only and data-driven and cannot host the Fluent
row/slot contract. Use the native-core Callout/FocusZone composition plus targeted native semantic and transaction
work.

During development, the Storybook app may gate a component's discovery on an endpoint whose route is not yet
implemented, with a linked issue and explicit reason. That gate must be removed before release, because every
component ships on all four endpoints (D01). Keep package imports safe on unsupported mobile hosts, surface a
descriptive error on use rather than a silent no-op, and never manufacture readiness generations or
confirmed-operation results the host does not provide.

### Win32 route and gap analysis (D01)

**Architecture:** native-core implements its experimental modern Callout and FocusZone contract for Win32 as a
JavaScript adapter over the prebuilt host's `RCTCallout`, `RCTFocusZone`, and `RCTFocusTrapZone` registrations.

- **Packaging:** expose the adapter from the existing, currently empty `@fluentui-react-native/native-core/win32`
  entrypoint; components consume it from `.win32.ts` files. Relax the modern-host assertion only for that entrypoint.
  The adapter may assume React 19, while `/legacy` keeps its signatures, behavior, and React 18 support, and its
  consumers never depend on the adapter. Bind `RCTFocusTrapZone` privately rather than through the v0 FocusTrapZone
  package. Close the Win32 items of #4376 as part of this work.
- **Capability detection:** read each host view manager's commands, props, and events at runtime (as Win32's own
  focus utilities do) instead of sniffing REX versions. Never dispatch `requestFocus`, `close`, or `reposition` to a
  host that does not declare them. Publish a static capability descriptor (for example: close acknowledgement,
  dismissal-cause precision, Tab continuation, initial-focus result) so components and tests choose behavior
  explicitly.
- **Truthful outcomes, no new status values:** components open and close by setting `open`; each presentation remounts
  a fresh legacy view, which on Paper gives it a new native identity. The handle's `close()` and `reposition()` return
  `'unsupported'` until the host acknowledges them. Readiness comes from `onShow` only after its ordering is
  qualified. Native dismissal reports an unclassified cause, except Escape, which JavaScript owns (below).

**Constraint:** a JavaScript package cannot add compiled functionality to the baked REX 0.81.1 host. Every native
addition below must be implemented and released by the Office/REX host owners. All four endpoints still ship together,
but R1 explicitly permits Win32 close-and-return until A1 is available. Other failed mandatory qualifications remain
release dependencies. #4384 is the single host backlog requested by R3.

| Requirement                                                               | Win32 host today (observed or inferred)                                                                                                                                                                                                                                                                                                                    | JavaScript workaround and owning layer                                                                                                                                                                                                                                                                                                                                    | Office/REX addition (tier below)                                                                                                            |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| View anchor, placement, flip/clamp, gap, size bounds, popup minimum width | `target`, `directionalHint`, `gapSpace`, `minPadding`, and minimum/maximum size props                                                                                                                                                                                                                                                                      | The adapter translates the live view binding and logical placement and refreshes `target` on attachment replacement. Dropdown measures its trigger and passes a numeric minimum width.                                                                                                                                                                                    | None expected; fix host geometry defects that qualification finds (DPI, scrolling, monitor origins). Never compensate with guessed offsets. |
| Positioned readiness                                                      | `onShow`                                                                                                                                                                                                                                                                                                                                                   | Map `onShow` to readiness once qualification shows content is attached and positioned by then.                                                                                                                                                                                                                                                                            | B2 if not.                                                                                                                                  |
| Latch, rearm, and close                                                   | `onDismiss` reports native dismissal; unmounting does not invoke it                                                                                                                                                                                                                                                                                        | Requested versus realized presence in the adapter; remount per presentation; fence an `onDismiss` that arrives after JavaScript requested close but before the unmount commits.                                                                                                                                                                                           | C1 (acknowledgements) is an enhancement.                                                                                                    |
| Popover entry focus (D05)                                                 | `setInitialFocus` focuses the first focusable content, with no fallback or result; `RCTFocusTrapZone` takes first focus by default; `onFocus` bubbles on Win32                                                                                                                                                                                             | Qualify the order of initial focus and `onShow`. If initial focus always precedes `onShow`, a content-root focus event before `onShow` proves success; otherwise JavaScript focuses the container and confirms it. No timers.                                                                                                                                             | B1 if the order is not deterministic.                                                                                                       |
| Menu and Dropdown entry focus                                             | The same, plus `focusWindow()` on the legacy Callout                                                                                                                                                                                                                                                                                                       | Framework Base focus targets in a render-ordered row registry (including disabled-focusable rows). When the target is not the first row, set `setInitialFocus` off, wait for readiness, activate the popup window with `focusWindow()`, request focus, and accept only the row's own focus event.                                                                         | None expected.                                                                                                                              |
| Escape and outside dismissal                                              | Host-provided; the recorded legacy cases pass                                                                                                                                                                                                                                                                                                              | None needed.                                                                                                                                                                                                                                                                                                                                                              | None.                                                                                                                                       |
| Truthful dismissal causes (D03)                                           | `onDismiss` carries no cause; `preventDismissOnKeyDown` disables the host's Escape dismissal                                                                                                                                                                                                                                                               | JavaScript owns Escape: set `preventDismissOnKeyDown`, let the deepest focused popup handle Escape, and report `escape` truthfully. Report every other native dismissal as unclassified. Qualify that Escape reaches JavaScript when no React Native descendant holds focus; otherwise leave that case to the host.                                                       | C2 (outside versus deactivation) only matters if a contract needs it; the reduced component API does not.                                   |
| Return to the trigger and D14                                             | Native default restoration; `onRestoreFocus` replaces it entirely and reports whether focus was inside                                                                                                                                                                                                                                                     | Native dismissal: when focus was not inside, do nothing (preserving D14); when it was, focus the trigger's target. Set `onRestoreFocus` only while a stable trigger target exists. JavaScript-initiated close: qualify the host's default restoration on unmount and `RCTFocusTrapZone`'s return first; add JavaScript restoration only if both fail.                     | B4 for races with later focus moves into native Office controls.                                                                            |
| Popover Tab stays inside (D05)                                            | The Callout window probably cycles Tab already (V1's Win32 E2E observes the cycle); `RCTFocusTrapZone`; FocusZone Tab modes                                                                                                                                                                                                                                | Qualify in order: the host default, then `RCTFocusTrapZone`, then FocusZone Tab modes. MenuButton and Dropdown must mark Tab handled before applying their own Tab policy.                                                                                                                                                                                                | None expected.                                                                                                                              |
| Arrows, Home/End, type-ahead                                              | Host FocusZone circular or stop-at-end navigation; `onKeyDown` delivers `key`; the key-descriptor declarations are inconsistent (`key` versus `code`); FURN's key helper drops Alt on Win32                                                                                                                                                                | Match on `nativeEvent.key`, never `code`, from an ordered row registry, with one owner per key. Alt shortcuts are not in the Flex contracts.                                                                                                                                                                                                                              | B7 only to suppress host handling, if the descriptor FURN emits is not honored.                                                             |
| Focusable disabled rows (D06)                                             | Win32 Pressable keeps `focusable` independent of `disabled`; V1's Win32 E2E arrows onto a disabled row; the custom focus ring is the Win32 default                                                                                                                                                                                                         | The Framework Base and MenuItem changes suffice in source.                                                                                                                                                                                                                                                                                                                | Only if announcements or refused activation fail qualification.                                                                             |
| Two-level submenus and hover-open (D07)                                   | Nested legacy Callouts (V1 Menu and ContextualMenu precedent); `onMouseEnter`/`onMouseLeave` and Pressability hover; `doNotTakePointerCapture`; no screen coordinates in mouse events                                                                                                                                                                      | Menu owns the branch registry, RTL arrows, row anchors, and cancellable timers; the adapter sets `doNotTakePointerCapture` on hover-opened submenus. Delay-only switching matches the Windows convention. The delay falls back to the Windows default (commonly documented as 400 ms) until the host exposes the user setting.                                            | B3 (input in a child popup must not dismiss its parents) and B8 (atomic family close) if qualification fails; C3 (live delay).              |
| Trigger press while open                                                  | Light dismissal and the trigger's press can both fire, reopening the popup                                                                                                                                                                                                                                                                                 | Snapshot the open state at the trigger's press-in; a popup that was open, or was dismissed between press-in and press, is not reopened. No timers. Applies to every platform.                                                                                                                                                                                             | B5 (anchor-aware light dismiss) if the host's event order is not guaranteed.                                                                |
| Tab past the trigger (MenuButton, Dropdown)                               | No next-tab-stop query in the Win32 JavaScript surface; the focus helper only dispatches focus commands                                                                                                                                                                                                                                                    | None that is general. Caller-supplied neighbor targets are rejected: they break with Office controls and reordered or disabled stops. The only interim is closing and restoring the trigger, which needs owner approval (section 9).                                                                                                                                      | **A1 (required).**                                                                                                                          |
| Accessibility semantics                                                   | Declared: `menu`, `menuitem`, `list`, `listitem`, `combobox`, `group`; no `listbox`, `menuitemcheckbox`, or `menuitemradio`; `Expand`/`Collapse`, `Toggle`, and `Select`/`AddToSelection`/`RemoveFromSelection`; `multiselectable`; `accessibilityControls` by `nativeID`; position-in-set props. CI already observes `menuitem` and button ExpandCollapse | Win32 projection: checkable rows use `menuitem` with `checked` and `Toggle` (V1 precedent); Dropdown uses a `list` container (`multiselectable` in multiple mode) and `listitem` options with `selected` and the three selection actions. Omit `accessibilityControls` while closed, and decide in the contract whether the role sits on the Callout or the content root. | B6 only where UIA inspection shows a missing control type, pattern, or cross-window ControllerFor.                                          |

**Office/REX host additions by tier:**

- **Tier A, full-parity follow-up (no JavaScript path):** A1, Tab and Shift+Tab continue from the trigger's own tab
  position. R1 approves close-and-return for the Win32 release until the host capability is delivered; A1 alone no
  longer blocks that release.
- **Tier B, required only if the named qualification fails:** B1 an initial-focus result or guaranteed ordering
  before `onShow`; B2 `onShow` meaning attached and positioned, or a ready event; B3 input inside a child popup not
  dismissing its owners; B4 guarded restoration against foreign-control races; B5 anchor-aware light dismissal; B6 UIA
  control types, patterns, and cross-window ControllerFor; B7 honoring FURN's key descriptors; B8 atomic family close.
- **Tier C, enhancements (the JavaScript behavior is truthful without them):** C1 close and reposition
  acknowledgements; C2 outside-click versus deactivation causes; C3 the live system menu show delay.

In P0, confirm which Tier B items existing host internals already satisfy. Record the A1 owner and release vehicle
in #4384 without blocking the approved interim or inventing a host delivery date.

Preserve public native registration names and legacy compatibility. Regenerate codegen rather than editing
generated output. Native mutations run on the UI thread; observers, monitors, windows and pending work are cleaned
up. Apple changes retain qualified React headers, guarded Swift imports, generated-type-free extern registration,
strict warnings, and both React-module and Office bridging-header integration modes. [E06, E13]

## 6. Accessibility, styling, and test contract

### Native semantics are an acceptance gate

- Specify role/name/value/state/relationships and supported operations for trigger, surface, collection, and item
  per endpoint. Do not apply a universal dialog role to all popup content.
- RNW candidates such as mapped `menuitem` plus checked state, or list/listitem plus selected/container state,
  require actual Toggle/Selection/SelectionItem verification. Do not ship unmapped web strings on assumption.
  The inspected string `accessibilityRole` path can assert in Debug and fall back to Group; the separate `role`
  enum path has different fallback behavior. Reproduce the actual chosen prop path rather than conflating them.
- macOS Fabric role/expanded/selected projection needs explicit AX-tree and VoiceOver evidence. A custom action
  label or spoken value string is not proof of a native relationship/selected attribute.
- Extend `resolveAccessibilityAction` only for reviewed shared needs. Windows Fabric action names differ from Win32
  declarations; Select/AddToSelection/RemoveFromSelection must not all toggle. Preserve caller actions and labels,
  deduplicate exact-name declarations, and count callbacks.
  Select replaces the selection; Add preserves other members; Remove removes only its target. Define disabled,
  read-only, single-mode and controlled-refusal outcomes for each operation.
- Invoke intended UIA patterns and actual AX actions directly. A driver accessibility-click convenience path may
  fall back to another pattern; its success does not prove the intended operation.
  Use a supported explicit native test path or a verified single-pattern fixture. If neither exists, record a test
  capability gap instead of inventing a driver API. Invoke exposure may require `onAccessibilityTap`; deduplicate
  it against Pressable activation before adding it.
- Hints can explain popup behavior but do not implement programmatic has-popup/control relationships. Qualify
  those separately; a missing typed prop is evidence about this JS surface, not every native host capability.

| Element               | Flex semantic target (web)                                                                                                                             | React Native candidate and gate                                                                                                                                                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Popover trigger       | Expanded state, controls relationship, dialog has-popup                                                                                                | `accessibilityState.expanded`; has-popup and controls have no typed RNW/macOS property (Win32 types `accessibilityControls`), so use a hint and record the gap                                                                                                                                                                |
| Popover surface       | Dialog role with a required name when content is interactive                                                                                           | RNW has no dialog role-string mapping; a labeled group is the candidate. macOS Paper maps dialog to a group; Fabric needs evidence                                                                                                                                                                                            |
| Menu surface and rows | Menu role with a name; menu items, checkbox/radio items with checked state; submenu rows with has-popup and expanded; disabled rows may stay announced | `menu` and `menuitem` are mapped on RNW; checkbox/radio item strings are not, so `menuitem` plus checked state (Toggle) is the RNW candidate. Win32 declares no checkable menu roles either, so it uses the same `menuitem`, `checked`, and `Toggle` projection (V1 precedent). Disabled rows report the disabled state (D06) |
| MenuButton trigger    | Button with menu has-popup, expanded, and controls                                                                                                     | Button plus `expanded`; has-popup through hint and divergence. Win32 button ExpandCollapse is already observed in CI                                                                                                                                                                                                          |
| Dropdown trigger      | Combobox with expanded, controls, required name, invalid state, and value from its text                                                                | `combobox` is mapped on RNW (with a value); macOS Fabric has no trait mapping and needs evidence                                                                                                                                                                                                                              |
| Dropdown listbox      | Listbox with a name, multiselectable in multiple mode; the popup surface itself has no role                                                            | RNW and Win32 `list` plus selection-container state (multiselectable/required) is the candidate; Win32 declares no `listbox` role. Never a dialog role on the surface                                                                                                                                                         |
| Dropdown option       | Option with selected (not pressed) state and position in set; disabled options may stay announced                                                      | RNW and Win32 `listitem` plus selected (SelectionItem), the three selection actions (title case on Win32), and position properties, supplied by the D09 option adapter instead of ListboxItem's current button-and-pressed projection                                                                                         |

Where a renderer cannot project a required role or state on any endpoint (for example, macOS Fabric menu, list, and
combobox roles or expanded and selected state), the D12 decision applies: make a narrow, qualified fix in native-core
or upstream in the renderer, and treat the semantic as a release gate on that endpoint rather than a waiver.

### Tokens and pipeline invariants

Proposed FURN bindings derived from the pinned Flex payloads through the public `flex-token-map.yaml` keys:

| Surface                                          | Proposed binding                                                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Popover surface fill                             | `color.surfaceNeutralNearer`                                                                                                    |
| Popover stroke                                   | `color.strokeNeutralSubtle` at `strokeWidth.thin`                                                                               |
| Popover radius                                   | `borderRadius.base400`                                                                                                          |
| Popover padding                                  | `spacing.componentBase400`                                                                                                      |
| Trigger-to-surface gap (also the submenu offset) | `spacing.componentBase100`                                                                                                      |
| Elevation                                        | `shadow.low`                                                                                                                    |
| Menu padding and item gap                        | `spacing.componentBase200`; no gap between items                                                                                |
| MenuButton trigger                               | Button's reviewed bindings; the down chevron uses the trigger foreground at 16/20/20                                            |
| Dropdown trigger                                 | Input's reviewed chrome, error/disabled bindings, and amended focus treatment; chevron foregrounds as in section 2, at 16/20/24 |
| Dropdown popup                                   | Popover bindings with reduced or zero padding; rows use ListboxItem's reviewed bindings                                         |
| Motion                                           | Flex marks it pending; native presentation is instant (deferred divergence)                                                     |

Record genuine gaps instead of substituting values: the arrow and motion are deferred divergences (D11); native
shadow and material parity is a visual acceptance item. Reuse Button, Input, MenuItem, ListboxItem, and Divider
style contracts without copying unrelated constants. macOS currently draws a `.menu` vibrancy material behind
content, while the modern Callout host supplies transparent/zero-radius appearance. Test the actual native
silhouette, fill, and shadow against the bindings above rather than assuming a styled inner View removes that chrome.

**Input focus amendment (D11, confirmed):** amend Input to implement Flex's variant-specific focus treatment (the
shared two-part ring over a softened boundary for outline; a thicker focus-colored bottom edge for underline; the
danger boundary kept beneath the indicator in error) and resolve its deferred `input-focus-indicator` divergence.
Dropdown reuses the amended treatment through the chrome resolver so sibling fields match. Never draw both a native
ring and a custom indicator on the same target.

**Down chevron (D11, confirmed):** add a down-chevron entry beside the existing right chevron in the package-private
shared icon sources (`src\common\iconSources.ts`), verify its rendering on all four endpoints, and use it for
MenuButton (static) and Dropdown (rotating). Do not define glyphs inside component files.

Follow the canonical Button pipeline: types/slots, state and accessibility, module-scoped style factories,
style application/`attachSlotProps`, pure rendering, assembly/display name, and explicit exports.
Use React 19 ref props, not `forwardRef`. Export component-qualified unstable stages and state types.
Keep render-only slots private, theme-only caches free of interaction/measurement state, user styles last,
and disabled-over-pressed-over-hovered precedence. Use the existing focus policy on actual targets, not duplicate
rings, native outlines, or component-local modality tracking.
For MenuButton, reuse Button state/styles but write a MenuButton-owned pure render function that places the
chevron **inside the same Pressable** and the popup surface outside it. Button's completed render subtree has
no trailing-insertion parameter; appending a sibling icon is not equivalent. Button's style selection also switches
padding through its icon-only branch, so MenuButton must select the content-layout metrics for every label/icon
combination while still detecting icon-only triggers for accessible-name warnings.

### Required scenarios

| Area                         | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public API                   | Finite axes; omitted/null slots; native prop/ref/handler/style forwarding; exact exports; root/trigger/content distinction; callback/object ref cleanup and replacement; constrained layout                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| State/lifetime               | Both controlled/uncontrolled directions; false versus omission; controlled refusal/delay; native dismissal while requested open stays true (latched) and explicit rearm; reduced `onOpenChange` reasons mapped from each native dismissal cause, including unclassified hosts; stale Ready/Closed/results; anchor loss; no duplicate events                                                                                                                                                                                                                                                                                                                                                                                     |
| Geometry                     | Accepted anchors/placements; flip/shift/fit; scrolling/transforms; RTL; DPI/backing scale; negative monitor origins; long text and bounded scroll content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Popover                      | Entry focus to the first focusable content or the container on pointer and keyboard opens; Escape and explicit close return to the trigger; centered default placement with cross-axis and primary-axis clamping; nesting diagnostic; Tab kept inside until continuation is enabled, then boundary close with natural continuation                                                                                                                                                                                                                                                                                                                                                                                              |
| Menu tree                    | Native focus; wrapping arrows; Home/End/type-ahead; disabled rows announced as disabled, focusable per the platform default, and refusing pointer, keyboard, and accessibility activation; pointer-open entry without a highlighted row; trigger press while open closes without reopening; removed/reordered items; root, child, and grandchild (deeper nesting diagnosed); submenus anchored to their row on the inline-end side with RTL flip; hover-open and hover-close at platform-default and overridden delays, hot-tracking, timer cancellation, macOS submenu-intent tolerance, and no hover opening from touch or pen; sibling switch; ancestor click; deepest Escape; Tab/Shift+Tab; one action and guarded restore |
| MenuButton                   | One Pressable; optional label and leading icon with the private static chevron; icon-only name; Down opens to the first item and Up to the last; pressed chrome while open; Tab moves past the trigger and Shift+Tab returns to it; one menu open at a time; held Enter/Space and stale keyup; expanded rather than toggle semantics                                                                                                                                                                                                                                                                                                                                                                                            |
| Dropdown                     | Active versus selected; arrows stop at the ends; stable string keys and single-mode diagnostics; empty/all-disabled/missing selections; single/multiple controlled/uncontrolled; reopening on the most recently toggled option; disabled never opens, including controlled opening; error; value display and count fallback; chevron rotation; expanded-state trigger emphasis; a popup never narrower than the trigger, with internal scrolling; native Select/Add/Remove; commit versus dismissal; Tab/Shift+Tab destinations; value announcements; Input focus amendment on outline, underline, and error                                                                                                                    |
| Native accessibility/visuals | Actual UIA/AX action dispatch and state; Narrator/VoiceOver; light/dark/high contrast; focus-ring exclusivity; inactive windows; scaling and native surface appearance                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Resources                    | Repeated open/close/rearm/reattach; independent scenes; no leaked windows/observers/timers; packaging/autolinking and relevant Office consuming-host evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Platform parity (D01)        | Every scenario above runs on macOS Paper, macOS Fabric, Windows Fabric, and Win32; a Win32 JavaScript workaround is tested against the same assertions as the native path it replaces                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

## 7. Implementation phases and gates

| Phase                    | Owner boundary                                                                          | Deliverable and exit gate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0: evidence and probes  | Component, accessibility, native-core, and Win32 host owners                            | Decisions D01-D14 are confirmed. Rerun the relevant native baselines; probe trigger key delivery, popup Tab behavior, the Callout entry-focus strategy, macOS disabled-row and hover conventions, and the native dismissal causes each platform can observe. On Win32, qualify the Callout's `onShow` and initial-focus order, `RCTFocusTrapZone` inside a Callout window, the host Tab cycle, restoration on unmount, the key descriptors the host honors, trigger-press ordering, and UIA projection of the planned roles. Agree the Tier A item and any needed Tier B items with the Office/REX owners, with dates.                                                                                                |
| P1: contract review      | One contract owner per component; platform and native-core reviewers                    | Re-read the pinned payloads and author the six contract files per component, recording consulted surfaces and each claim's classification. Review the coupled deltas in the same pass: the MenuItem amendment (identity, type-ahead text, registration, disabled-focusable), the ListboxItem `value` key and Dropdown option adapter, the Input focus amendment, the Framework Base disabled-focusable capability, and the native-core API changes, including the Win32 adapter's capability descriptor. State the Win32 role vocabulary where it differs. Popover first; Menu and Dropdown next; MenuButton after Menu's shape. Pass `check:spec-contracts` and explicit pre-code review before each implementation. |
| P2: shared prerequisites | Native-core, Framework Base, and leaf owners; Office/REX host owners for host additions | Codify the native-core dependency (D02). In native-core, add the Callout `first`/`last` entry strategy, truthful dismissal causes, the #4377 family/continuation subset, the #4375 geometry fixes, the Windows menu-delay setting, the macOS submenu-intent signal, and the Win32 adapter at `/win32` with capability detection and its JavaScript workarounds. Land the Framework Base and leaf amendments, including the macOS Pressable adaptation for disabled rows, with their own tests and changesets. Track the Office/REX additions as named, dated dependencies.                                                                                                                                            |
| P3: Popover #4236        | One cohesive component owner                                                            | Complete pipeline, root/trigger/content refs, lifecycle, surface styling, explicit exports, tests/stories/changeset. Gate on controlled/uncontrolled behavior, native dismissal and reasons, readiness, geometry, and entry focus on all four endpoints.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| P4a: Menu #4232          | One cohesive component owner                                                            | Flat collection first, then nested family integration within the two-level limit, hover-open submenus, and discoverable disabled rows. Gate delivery on subtree/sibling/ancestor behavior, Tab behavior, guarded return, native semantics and action counts on all four endpoints.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| P4b: Dropdown #4224      | One cohesive component owner                                                            | May proceed independently of Menu after Popover and the option adapter. Deliver the Input-chrome Pressable trigger, single/multiple selection, private listbox/group subparts, real option focus with trigger emphasis, Tab continuation, accessible value, and constrained list behavior. No Combobox scope.                                                                                                                                                                                                                                                                                                                                                                                                         |
| P5: MenuButton #4231     | One cohesive component owner                                                            | After Menu's reviewed pipeline: Button composition, private down chevron, one open owner, native expansion semantics, Up/Down entry, and Tab past the trigger.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| P6: ratify and deliver   | Component and release owners                                                            | Reconcile realized types/tests/stories/native evidence; ratify source records; refresh reports, changesets, readiness under #4216/#4251; merge before issue closure. No bundle/branch/all-skipped run counts as delivery.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

P1 may proceed for different components once their own inputs are ready. P2 is a set of consumer-specific
prerequisites, not a monolithic platform rewrite. Do not split one component's state/styles/render implementation
across disconnected agents.

**Release rule (D01, confirmed):** a component becomes publicly exported only when it meets its acceptance on all
four endpoints. Prerequisite native-core, Framework Base, and leaf changes may merge earlier as independently
qualified changes, preserving `/legacy` stability. An experimental or preview label may limit features, but never
platforms; match #4251's readiness level to actual visual, device, keyboard, and screen-reader evidence.

## 8. Validation plan

**Planning-session status:** implementation tests, builds, bundles, native runs and assistive-technology sessions
are **not run**; none is claimed by this document. The following are future implementation checks, based on
declared workspace scripts. Documentation-only planning does not require root buildci.

Run targeted name selectors while iterating, then the owning package checks. The repository Jest wrapper appends
discovered platform paths, so positional `--runTestsByPath` is not a reliable isolation mechanism.

```powershell
yarn workspace @fluentui-react-native/components check:spec-contracts
yarn workspace @fluentui-react-native/components test --testNamePattern "Popover|Menu|MenuButton|Dropdown"
yarn workspace @fluentui-react-native/components format --check
yarn workspace @fluentui-react-native/components lint
yarn workspace @fluentui-react-native/components build
yarn workspace @fluentui-react-native/components test
```

After adding/revising contract records, precede the contract check with:

```powershell
yarn workspace @fluentui-react-native/components report:spec-source-drift --offline --write
```

This effort changes Framework Base, native-core, and the delivered MenuItem, ListboxItem, and Input components, so
run each owning workspace's declared format, lint, build, and test scripts, and review snapshot diffs before
updating them. Native-core schema changes require generation and
`yarn workspace @fluentui-react-native/native-core codegen:windows --check`; its Swift and Objective-C changes need the
R-APPLE-007 module and bridging-header checks.
Add all test-bearing stories to `tsconfig.stories.json`; use named top-level `wdio` callbacks, stable testIDs,
type-only `WdioStory` imports, and dynamically imported Node-only helpers.

```powershell
yarn workspace @fluentui-react-native/agentic-components-storybook storybook manifest --windows
yarn workspace @fluentui-react-native/agentic-components-storybook storybook manifest --macos
yarn workspace @fluentui-react-native/agentic-components-storybook storybook manifest --win32
yarn workspace @fluentui-react-native/agentic-components-storybook storybook bundle --windows
yarn workspace @fluentui-react-native/agentic-components-storybook storybook bundle --macos
yarn workspace @fluentui-react-native/agentic-components-storybook storybook bundle --win32
```

Use IDs returned by manifests, not guessed slugs, for focused `storybook test --<platform> --story '<id>'` runs.
On appropriate interactive hosts, execute the native lanes separately:

```powershell
yarn workspace @fluentui-react-native/agentic-components-storybook storybook prep --windows
yarn workspace @fluentui-react-native/agentic-components-storybook storybook build --windows
yarn workspace @fluentui-react-native/agentic-components-storybook storybook smoke --windows --mode stories-and-tests
yarn workspace @fluentui-react-native/agentic-components-storybook storybook smoke --win32 --mode stories-and-tests
yarn workspace @fluentui-react-native/agentic-components-storybook storybook prep --macos
yarn workspace @fluentui-react-native/agentic-components-storybook storybook build --macos
yarn workspace @fluentui-react-native/agentic-components-storybook storybook smoke --macos --mode stories-and-tests
yarn workspace @fluentui-react-native/agentic-components-storybook storybook prep --macos --paper
yarn workspace @fluentui-react-native/agentic-components-storybook storybook build --macos --paper
yarn workspace @fluentui-react-native/agentic-components-storybook storybook smoke --macos --paper --mode stories-and-tests
```

Re-prep when switching macOS renderers. Win32 uses a prebuilt host; there is no `build --win32` acceptance command.
Host changes require the host owner's actual build/integration command and result. Apple changes need the
additional R-APPLE-007 module/bridging-header checks; do not invent an Office invocation unavailable to the session.

Use documented smoke selectors for primitive baselines and new overlay cases, then clear them for acceptance.
Report endpoint/renderer/version, executed cases, passed/failed/skipped counts, and unsupported/not-run capabilities.
Inspect results rather than aggregate zero exit (#4342); mandatory skipped behavior remains unqualified.
Shutdown owned Metro instances after use. No native input/privacy changes or broad process cleanup is implied.

Public exports/types change, so run `yarn build`; add affected-package changesets and run `yarn change:check`.
For instruction changes run `yarn check-agent-instructions`. Finish implementation/configuration changes with:

```powershell
yarn clean-lage-cache
yarn lage buildci
```

## 9. Owner decisions

The owner confirmed these decisions on October 16, 2026. Where a decision says "recommended", the recommendation from
the reviewed draft applies as stated; the right column points to the sections that implement it.

| ID  | Confirmed decision                                                                                                                                                                                                                                                                                 | Applied in                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| D01 | **All platforms ship together.** Every component releases on macOS Paper, macOS Fabric, Windows Fabric, and Win32 at once. Each Win32 gap gets a JavaScript workaround where possible, otherwise a named native addition.                                                                          | Sections 1, 5 (Win32 route), 6, 7 (release rule) |
| D02 | **Native-core is a relied-upon dependency.** This effort adds or updates native-core code as needed. `/legacy` APIs stay stable; modern APIs are experimental and may change. Native-core components and adapters never depend on Design.                                                          | Sections 2, 3, 5, 7                              |
| D03 | **Extensible lifecycle with native defaults.** Native-authoritative presence with latch and rearm; native default behaviors unless a contract names an override; truthful dismissal causes at the native boundary, reduced to a coarse `onOpenChange` reason at the component API.                 | Sections 3, 4, 5                                 |
| D04 | **Recommended:** distinct root, trigger, and content refs; a trigger slot or an external-trigger binding; no child cloning; named anchors only with host evidence.                                                                                                                                 | Section 3                                        |
| D05 | **Recommended:** entry focus on every open through the new Callout `first` strategy; Tab stays inside the popup with Escape as the exit until continuation exists; nonmodal only; bounded scrolling with native clamping.                                                                          | Sections 2, 4, 5                                 |
| D06 | **Recommended, plus disabled-focusable rows:** a context-aware MenuItem amendment (identity, type-ahead text, registration), and MenuItems may be focusable while disabled so screen readers find them. MenuItem is updated in this effort.                                                        | Sections 3, 4, 5, 6                              |
| D07 | **Hover-open submenus** with platform-standard default timing, overridable. The rest of the recommendation is unchanged: close on every non-submenu activation, adopt the two-level limit, and require native Tab continuation (now built by this effort) for full Menu and MenuButton acceptance. | Sections 2, 4, 5                                 |
| D08 | **Recommended:** a Pressable trigger with Input chrome satisfies "Input-based trigger chrome"; private listbox, groups, and value text; the clear-selection and tag-strip patterns are deferred; no public Option/Listbox exports.                                                                 | Sections 2, 3                                    |
| D09 | **Recommended:** real option focus as a recorded Dropdown divergence; a contextual ListboxItem adapter that preserves standalone behavior; multiple mode reopens on the most recently toggled option. Applying the decision, the trigger keeps an expanded-state emphasis.                         | Sections 2, 3, 4                                 |
| D10 | **Recommended:** stable string keys with an explicit mode (`selectedOptions` triple with `multiselect`); labels with a count fallback; no Apply/Cancel model; no component-enforced closing of other Dropdowns.                                                                                    | Section 3                                        |
| D11 | **Recommended:** the arrow and motion are deferred divergences; the down chevron is added to the shared icon sources; Input gains the variant-specific focus treatment, which Dropdown reuses.                                                                                                     | Sections 2, 6                                    |
| D12 | **Recommended:** existing native composition plus narrowly qualified semantic fixes in native-core or the renderers; no OS-control substitution.                                                                                                                                                   | Sections 5, 6                                    |
| D13 | **Deferred:** secondary-click detection and point anchors move to #4383.                                                                                                                                                                                                                           | Sections 1, 2, 4                                 |
| D14 | **Recommended:** after an outside click, keep a newly focused control; otherwise return to the trigger.                                                                                                                                                                                            | Section 4                                        |

### Reviewed follow-up decisions

The owner marked R1-R3 reviewed in this plan before implementation. These answers supersede contrary
recommendations in the earlier planning tables; they are not unanswered questions.

| ID  | Item and recommendation                                                                                                           | Why it matters                                                                                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Confirmed:** use the Win32 release interim: Tab closes the popup and returns to its live trigger instead of continuing past it. | Track full owner-relative continuation in #4384. This is a behavior exception, not permission to omit an endpoint.                    |
| R2  | **Confirmed:** Menu defaults disabled rows to focusable on Windows/Win32 and opt-in on macOS.                                     | Standalone MenuItem's new `disabledFocusable` defaults to false on every platform; the future Menu context owns its platform default. |
| R3  | **Confirmed:** create one FURN issue for required Win32 host improvements.                                                        | Created #4384. Host owner, release vehicle, and failed Tier B findings remain to be recorded there, not guessed.                      |

## 10. Reciprocal review and reconciliation

Two independent investigations used **Claude Opus 5.5** (`claude-opus-5.5`) and **GPT 6 Astra** (`gpt-6-astra`),
each requested with `reasoning_effort: max` and `context_tier: long_context`, the maximum exposed context tier.
Each then received the other's complete proposal in its original thread for reciprocal adversarial review.
Complete working reports remain private session artifacts rather than public source material.

**Completed:** both independent proposals and both reciprocal cross-reviews were read in full and reconciled.
The reviews identified substantive corrections rather than merely agreeing with each other:

| Disagreement or defect                                                             | Resolution in this plan                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input instance required versus style-resolver-only Dropdown                        | Resolved by the later Flex consultation: the trigger has button and combobox semantics and borrows only Input's chrome. D08 confirms the issue wording.                                                             |
| Flat Menu/close-to-trigger Tab as initial completion                               | A flat milestone is partial. Flex caps submenus at two levels, superseding the earlier "no arbitrary cap" resolution, and makes MenuButton's Tab move past the trigger; full acceptance stays gated by #4377 (D07). |
| FocusZone `direction="none"` as generic initial-focus workaround                   | Rejected: Windows still intercepts Home/End. Use an explicit target or reviewed native operation.                                                                                                                   |
| Refused focus means the trigger retained focus; cached focus-inside allows restore | Rejected: native activation may already have changed. Actual focus/window and post-callback generation/eligibility guards are mandatory.                                                                            |
| Replacing Callout's content host with RootInputBoundary                            | Rejected under the existing public contract. Keep Callout's attachment View and nest the boundary inside it.                                                                                                        |
| Options are already selectable because ListboxItem exists                          | Rejected: identity, real option semantics, Select/Add/Remove actions and native state need explicit contract work.                                                                                                  |
| Win32 must automatically support modern APIs or be dropped                         | Neither. Evaluate the legacy route per capability; approve and document any restriction, and gate story discovery.                                                                                                  |
| Every catalog contract universally requires a Flex-only source                     | Rejected. Follow the requested pinned Flex workflow; other adapters remain valid with explicit source-authority review, without falsely claiming Flex consultation.                                                 |
| Native role props or generic accessibility click prove semantics                   | Rejected. Distinguish prop/mapping paths and invoke the specific UIA/AX operation; native gaps limit the readiness claimed.                                                                                         |
| Root-ref identity and MenuItem/ListboxItem amendment preferences                   | Prefer explicit stable roots and private/contextual reuse; leave exact ref/leaf/API choices in D04/D06/D09 rather than averaging incompatible designs.                                                              |

Report identities (SHA-256 of complete preserved session artifacts):

| Artifact                   | Model           | SHA-256                                                            |
| -------------------------- | --------------- | ------------------------------------------------------------------ |
| Independent Opus proposal  | Claude Opus 5.5 | `eefbfe22d19ecc5efe32b33fac4639dfc11fccd24e92342dbdeaad2f532355ec` |
| Independent Astra proposal | GPT 6 Astra     | `9c6189460d06b8b1f5a9dd7bda75a95c1c1618427571259e3bccc4375e83eda9` |
| Opus review of Astra       | Claude Opus 5.5 | `054664e5d71d4719f05fd34b44e7ebf77c2f76b8c21403fba2974467b8793029` |
| Astra review of Opus       | GPT 6 Astra     | `6fbbf05c88955c3c3d8f10b66e6b5dcb2d0d1f4db5c6cbfac2611d6197186761` |

### Flex payload update

The independent proposals and cross-reviews above predate payload access. Afterward, the coordinating Claude Opus
5.5 session read the pinned payloads (section 2, E15), verified their identities, and revised sections 1-9.
The update resolved the Dropdown trigger interpretation, the submenu depth limit, Dropdown's read-only state, and
MenuButton's prop exclusions. It introduced the Dropdown focus-model conflict (D09), Popover entry focus and the
Callout `first` strategy addition, Tab continuation past MenuButton and Dropdown triggers, context-menu opening
(D13), and the outside-click focus adaptation (D14).

**Reciprocal review of the update:** completed by GPT 6 Astra in its original maximum-reasoning, long-context
thread against the private payloads and current source. It confirmed the four new native claims, the
Popover/Menu token keys, all 20 E15 digests, and the absence of verbatim source wording. Its six corrections are
incorporated: Dropdown inherits Input's variant-specific focus treatment rather than FURN Input's current
stroke-only divergence (high); consumer-chosen entry focus and multiple-mode reopening on the most recently toggled
option; the error-state chevron binding; the recorded Tab source conflict and Popover-scoped outside-click
behavior; MenuButton's fixed content-layout metrics; and removal of a categorical TextInput/Combobox claim.

| Artifact                                                                       | Model       | SHA-256                                                            |
| ------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------ |
| Astra review of the Flex update (preserved transcription of its inline report) | GPT 6 Astra | `b2606bcb6a010b54bdd1376f6958d7942fd797d7cabeeca369634de85c0fe10d` |

### Owner decisions update

The owner confirmed D01-D14 on October 16, 2026, and the coordinating session applied them to sections 1-9. #4383
was created for the deferred context-menu scope. For D01, GPT 6 Astra produced a Win32 gap analysis and native-core
additions inventory in its original thread, and Claude Opus 5.5 adversarially reviewed it against current source and
installed packages. The review concurred with the native-core Win32 adapter and corrected the analysis, and the plan
incorporates those corrections:

- the missed host `RCTFocusTrapZone` as a candidate for first focus, Tab containment, and return focus;
- Win32's role vocabulary (no `listbox` or checkable menu roles);
- JavaScript paths for latch and rearm, Escape attribution, restoration, and conditional initial-focus fallback;
- rejecting caller-supplied neighbor targets for Tab continuation;
- new rows for trigger presses while open, cross-window `accessibilityControls`, key-descriptor inconsistencies, and
  pointer-open entry;
- explicit packaging and capability detection; and
- a tiered host-addition list in which only Tab continuation is required outright.

| Artifact                                                          | Model           | SHA-256                                                            |
| ----------------------------------------------------------------- | --------------- | ------------------------------------------------------------------ |
| Win32 gap analysis (preserved transcription of its inline report) | GPT 6 Astra     | `0a598053a32f50edd685e83948ad805931ffc4546680c1d3a038a52a80ae9591` |
| Review of the Win32 gap analysis                                  | Claude Opus 5.5 | `b94b1b322957516136a5eb6457ae826f3fba1c37e778a5b692c17f8f8c4ddeb5` |

## 11. Source ledger

Paths/ranges identify inspected source at the baseline, not runtime qualification. Installed renderer source
references are version-bound; recheck them after dependency updates.

| ID  | Primary evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E01 | Full issue bodies #4236, #4232, #4231, #4224; relevant current #4374-#4380, #4342/#4344 and merged #4381. Historical #4308 is closed/unmerged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| E02 | `packages\agentic\components\AGENTS.md:33-65`; `src\AGENTS.md:15-35`; `src\components\AGENTS.md:24-64`; `SPEC-SOURCE.md:24-96,146-210`, relative to that package.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| E03 | `packages\agentic\components\src\index.ts:37-115`; `src\index.test.ts:1-92`; canonical Button types/state/styles/render/assembly in `src\components\button`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| E04 | `packages\agentic\components\src\components\input\input.types.ts:20-58`, `useInput.ts:27-48,145-190`, `input.styles.ts:316-360`; `menu-item\useMenuItem.ts:17-87`; `listbox-item\useListboxItem.ts:16-81` relative to the components directory.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| E05 | `packages\agentic\native-core\src\components\callout\SPEC.md:3-51`, `Callout.types.ts:6-47`, `Callout.tsx:32-177`; `focus-zone\SPEC.md:3-38`, `FocusZone.tsx:14-85`; `src\internal\CalloutHost.tsx:16-53`, relative to native-core where abbreviated.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| E06 | Native-core `src\macos\index.ts:1-15`, `src\windows\index.ts:1-15`, `src\index.ts:1`, `src\win32\index.ts:1`, `src\internal\modernHost.ts:4-11`, `focusZoneCommands.win32.ts:1-13`; legacy Callout/FocusZone contracts and wrappers; `package.json:37-88,122-164`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| E07 | Native-core `README.md:249-323`; `src\components\callout\Callout.stories.tsx:140-218,334-363`; `menuComposition.wdio.ts:4-40`; `apps\storybook\storybook.config.mts:17-40`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| E08 | Native-core `macos\components\Callout\shared\CalloutView.swift:105-253`, `CalloutWindow.swift:11-41`; `windows\NativeCore\components\Callout\Callout.cpp:20-105,201-248,294-316,368-466,477-626`; `windows\NativeCore\shared\FocusRequest.h:8-55`; `windows\NativeCore\components\FocusZone\FocusZoneComponentView.cpp:72-179`; `macos\components\FocusZone\shared\RCTFocusZone.m:142-181,608-713`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| E09 | Framework Base `src\hooks\focusTarget.ts:3-166`, `useFocusTarget.ts:17-58`, `useFocusablePressable.native.ts:35-194`, `useToggleState.ts:4-88`; `src\component-patterns\slot.ts:118-142`; Design `src\theming\RootInputBoundary.tsx:8-19`; agentic MenuItem/ListboxItem colocated specs and interaction/accessibility companions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| E10 | RNW 0.81.35 installed source: `Microsoft.ReactNative\Fabric\Composition\UiaHelpers.cpp:301-362`; `CompositionDynamicAutomationProvider.cpp:193-291,869-951,1001-1104`. RNmacOS 0.81.9: `React\Fabric\Mounting\ComponentViews\View\RCTViewAccessibilityElement.mm:118-148`, `RCTViewComponentView.mm:486-517,1565-1716`. Win32 0.81.9: `Libraries\Components\View\ViewAccessibility.d.ts:138-162`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| E11 | `packages\framework-base\src\accessibility\resolveAccessibilityAction.ts:1-49`; its `AGENTS.md:10-67`; `references\agents\accessibility\action-transport-evidence.md:14-33`; focus `common.md`, `windows-win32.md`, and `macos.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| E12 | `agency.toml:1-13`; `packages\agentic\components\spec-source-lock.json:1-99`; `spec-source-report.json:1-15`; `references\agents\components\agentic\contract-sources\flex-x3.md:12-44`; component contract checker draft/catalog/source rules.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| E13 | `packages\agentic\native-core\AGENTS.md:3-40`; `references\agents\native\components-and-modules.md:11-29`, `apple-office.md:15-42`, `windows-fabric.md`; V1 native MenuButton source in `packages\components\MenuButton\src`; native-core podspec, Windows project/provider and Paper/Fabric bridges.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| E14 | `references\agents\repository\development.md:18-28,66-91`; components `package.json:31-46`; framework-base `package.json:30-39`; native-core `package.json:77-88`; `apps\storybook\package.json:13-25` and `AGENTS.md`; `packages\agentic\storybook-desktop\README.md:103-145,255-287`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| E15 | Pinned Flex payloads read at `agency-microsoft/.github-private@206c4996205b027f4d806ac4ac7366f1f0ab0d5a`, under `catalogs/flex/plugins/components/skills/<name>/`. Plugin trees: components `b08bdc0d5ad2677f34d2010fd384bd37109a14e3`, system `4529d8f9af7a4790ca66de183487147a08667916`, tokens `0ccc639601bff986c4c197813df85eebacf4909e`, all equal to the source lock. Target digests are listed below; the MenuItem, ListboxItem, and Input digests match their reviewed `spec\source.json` records. Content is paraphrased only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| E16 | Native presentation and focus facts used by the Flex update: native-core `macos\components\Callout\shared\CalloutView.swift:164-169` (popup ordered front and made key only for initial focus); `windows\NativeCore\components\Callout\Callout.cpp:421-436` (only the legacy path focuses the popup on show); `src\components\callout\SPEC.md:37-48` (outside-input and deactivation policy); `src\components\callout\Callout.types.ts:17-19` (target-only `requestFocus`); `macos\shared\FRNNativeCoreFocusService.swift:5-31` and `windows\NativeCore\shared\FocusRequest.h:29-54` (`first`/`last` strategies); `src\components\focus-zone\FocusZone.types.ts:17-21` (`arrowBoundary`, `tabNavigation`). Components `src\components\listbox-item\SPEC.md:94-96` (accepted real-focus divergence) and `src\components\input\SPEC.md:114-125` (focused-stroke treatment and deferred ring divergence).                                                                                                                                                                                                                                                                                                                                                                                                        |
| E17 | Evidence used to apply the owner decisions: components `src\components\menu-item\useMenuItem.ts:57-71` (disabled rows are excluded from focus); Framework Base `src\hooks\useFocusablePressable.native.ts:42-43,190` (focus targets register only when enabled) and `src\hooks\useToggleState.ts:23-26,70-86` (the disabled guard); native-core `src\components\callout\Callout.types.ts:10-13,26` (view/rect/point anchors and the current dismissal reasons) and `src\legacy\callout\Callout.types.ts:22-98` (legacy `dismissBehaviors`, `anchorRect`, `onRestoreFocus`, `onShow`, `onDismiss`, `setInitialFocus`, window commands); V1 `packages\components\Menu\src\consts.ts:3-6` (hover delays), `MenuPopover\useMenuPopover.ts:52-61` (hover-out close), and `Menu\useMenu.ts:11-15` (reopen guard); components `src\common\iconSources.ts:3-12` (no down chevron); the Windows menu show delay `SPI_GETMENUSHOWDELAY` (Microsoft Learn `SystemParametersInfoW` reference), whose 400 ms default comes from secondary sources only; deferred context-menu scope #4383.                                                                                                                                                                                                                                 |
| E18 | Win32 evidence cited by the gap analysis and its review: native-core `package.json:62-73` (reserved `./win32` export), `src\win32\index.ts` (empty), `src\internal\modernHost.ts:8-10`, `src\specs\components\CalloutNativeComponent.ts:68-82`, `src\legacy\focus-zone\FocusZone.types.ts:41-60,98-102`, and `windows\NativeCore\packages.lock.json:38-42` (Windows App SDK pin); `docs\pages\Components\Callout.md:33-35,95,99` (unmount, initial focus, restoration); `packages\components\FocusTrapZone\src\FocusTrapZoneNativeComponent.ts:19-39`; installed react-native-win32 `Libraries\Components\View\ViewAccessibility.d.ts:111-162,192-200,225-265,424-436,479-489,501-567`, `Libraries\Components\Pressable\Pressable.win32.js:273-313`, `Libraries\Utilities\FocusManager.win32.js:17-39`, `Libraries\Types\CoreEventTypes.win32.js:340-362`, and `Libraries\Components\View\ViewPropTypes.d.ts:153-178`; installed react-native-macos `Libraries\Components\Pressable\Pressable.js:378,383` (focusability and ring disabled with `disabled`); `packages\utils\interactive-hooks\src\useKeyProps.ts:16-19,36,87-93`; V1 Win32 E2E `apps\E2E\src\Menu\specs\Menu.spec.win.ts:30-35,53-62,121-158,163-179`. REX itself is binary-only, so every host behavior here stays inferred until qualified. |

**E15 target-file SHA-256 digests**

| Component   | File                   | SHA-256                                                            |
| ----------- | ---------------------- | ------------------------------------------------------------------ |
| popover     | `SKILL.md`             | `10076f71bd48209300ad9d9407a2f99e4c19f917008e207ec33e0ac0261513c9` |
| popover     | `usage.md`             | `672ee5bdc4219b62b2f072ab9f66a7eda3be3a64f82243811ccd033825f16b70` |
| popover     | `web/accessibility.md` | `15ab4d7e704d17a0a436a5aa4ca6c9d115b96a7b9ec347a54b4b461a9f0da327` |
| popover     | `web/interaction.md`   | `81f330b296337b414c66d5899b98323e1734c8747179dcc0f1b3d8d94edcdd2e` |
| popover     | `web/tokens.yaml`      | `270f630afc036cb008ecf9dc80fbb4d80354b9facc8b30b76eb1d71bef021954` |
| menu        | `SKILL.md`             | `1628ce7eea7ce1e9f6664dd9b7c6e96265daa10fa1e84aa2a1621fa6af82c360` |
| menu        | `usage.md`             | `a197fde5775c9c0d76175acf12156811d0338514d586af9bfd893f153bdea387` |
| menu        | `web/accessibility.md` | `f46c66630a38a7f393dbcea7d04c421193b9a7e7dd61b0c18bf99fd86610c0f7` |
| menu        | `web/interaction.md`   | `0e867fa8bf752f2f8e5c7e097b5dbf98bd219236ff873a1b30c9bc3d90ea5ee8` |
| menu        | `web/tokens.yaml`      | `93ca83f04943521ef659918259954246b477b99bb479f876fb121e879f72504f` |
| menu-button | `SKILL.md`             | `af46dc78a0cc2deaa57f117dc75651197741a4c516a758764b0a286afd947278` |
| menu-button | `usage.md`             | `64d305bb28680e70af9509f87d98c199f667fc4c08e6ea24400466835b6c7516` |
| menu-button | `web/accessibility.md` | `bc74d18cc63083d9efb02397d5f34b4bee2e12da4c9fa34150a237643fbcc290` |
| menu-button | `web/interaction.md`   | `4a0b9b4858c985d809f8b6205e3a6fb1f0d51d9280b69034788ecb3f196a1850` |
| menu-button | `web/tokens.yaml`      | `77055087f07a0a436c8745f629b938de9f96d3d6923132d8f44bca1c23672324` |
| dropdown    | `SKILL.md`             | `90e1eeb0225d4898b3ee9d5790bf161e9700a1aebf81f0813f37361aee80d3e3` |
| dropdown    | `usage.md`             | `ab7b9d721133baa0b2f4334c3d7c08a9d0b96c37297d8487cd8355cd34bfd825` |
| dropdown    | `web/accessibility.md` | `989cbd718c3eb9e3ea9bed1906621cc86ea2ed3499242839bf0859357c04b1e3` |
| dropdown    | `web/interaction.md`   | `0d6dbb8a3f3eef1daffc5d40d10ec3e1eca274e02a2d54bb00a0e92e21a0262c` |
| dropdown    | `web/tokens.yaml`      | `91bc29fe8de636a028ed58673967fa79842d9991e13f62dbd4cd189d492b5983` |

## 12. Implementation handoff

### Scope and stopping boundary

Implementation began on October 16, 2026 on `user/jasonvmo/menu-popover`.
This handoff delivers independently usable **P2 prerequisites**, not completed
Popover, Menu, MenuButton, or Dropdown components. None of those four is
implemented or newly exported. P0/P1 still need the macOS and consuming
Office/REX evidence below; do not turn the reviewed plan or these prerequisite
tests into approval of a new component contract.

The Windows runtime did not advertise the physical-input capabilities required
by the P0 cases. The native helper's doctor check was ready, but that does not
override per-session capability gating. No input/privacy policy was weakened.
These gates and the unavailable macOS/Office lanes are the cross-machine
stopping point, not approval to substitute mocked focus for native evidence.

| Area                  | Implemented in this branch                                                                                                                                                                                                                                                                                                                                                                                   | Still required                                                                                                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D03/D05 Callout       | Modern `requestFocus` accepts `first`/`last` through the wrapper, generated command, Windows implementation, and both macOS adapters. Actual native results remain authoritative. Known native branches report Escape, outside pointer, or application deactivation; unclassified notifications stay unclassified. Duplicate close and late ready events cannot revive or renotify a dismissed presentation. | macOS compilation/runtime/Office integration; first-content/container fallback in Popover; guarded restoration and family transactions. This is not a Win32 modern adapter.                                                            |
| D06 disabled commands | Framework Base `disabledFocusable` option and MenuItem prop, default false. Disabled semantics, registered focus target, activation refusal, and focus feedback are separate. macOS omits only the native Pressable disabled flag in this opt-in mode and retains the disabled accessibility state. Headers never become focus stops.                                                                        | Native focus/disabled announcements on each endpoint; future Menu context, stable row identity/registration/type-ahead text, and R2 platform defaults.                                                                                 |
| D11 Input focus       | Outline uses the shared two-part focus-visible overlay; underline adds a thin focus-color inset above the existing boundary. Error/read-only retain their boundary, disabled wins, and the actual editor's native ring is suppressed. Scene modality and editor/root refs retain their existing owners.                                                                                                      | Visual/native qualification on every endpoint; Dropdown reuse and the shared down chevron when its consumers are implemented.                                                                                                          |
| R1-R3 Win32           | Approved answers reconciled into this plan; consolidated host issue #4384 created. `/legacy` remains stable and no new managed protocol is sent to the baked host.                                                                                                                                                                                                                                           | Capability-gated modern adapter, readiness/initial-focus/restore/family probes, the approved close-and-return Tab policy, and any failed Tier B host work.                                                                             |
| Remaining P2-P6       | No claim of completion.                                                                                                                                                                                                                                                                                                                                                                                      | Four six-file source-backed contracts and their explicit pre-code reviews; native family/continuation/geometry/hover/semantic work; leaf collection adapters; all four complete component pipelines, exports, tests, and ratification. |

The 20 target Flex payload digests and the five Input payload digests were
reverified against the unchanged pin. Private payloads stayed outside the
public worktree. Only the existing MenuItem/Input contracts and experimental
Callout contract were amended and explicitly reviewed before their code.
MenuItem/Input remain `contract-reviewed` pending the new native evidence;
passing JavaScript checks does not ratify the four absent components.

### Current validation

All Storybook commands below use
`yarn workspace @fluentui-react-native/agentic-components-storybook`.
The two smoke selectors were `STORYBOOK_SMOKE_STORY='native-modern-callout--*'`
and `'components-*--*focus*'`, with `STORYBOOK_SMOKE_TAG='story'`.

| Check                                                                                                                                              | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn workspace @fluentui-react-native/framework-base test`                                                                                        | **Passed:** 205 tests, 6 snapshots. Includes disabled-target registration, refused activation, omitted native handlers, and exactly-once keyboard release after disable.                                                                                                                                                                                                                                                                                                                 |
| `yarn workspace @fluentui-react-native/components test`                                                                                            | **Passed:** 484 tests, 8 snapshots; contract and strict story checks included. Read-only focus unit coverage invokes the native callback because the test library suppresses `focus` on noneditable editors; the actual native case remains mandatory.                                                                                                                                                                                                                                   |
| `yarn workspace @fluentui-react-native/native-core test`                                                                                           | **Passed:** 18 ownership/entrypoint tests plus 37 Jest tests and 1 snapshot; build and strict story checks included.                                                                                                                                                                                                                                                                                                                                                                     |
| Owning workspace `build`, `lint`, and `format --check` for Framework Base, components, and native-core                                             | **Passed.** Root formatting and package lints also passed in the cache-cleared CI attempt.                                                                                                                                                                                                                                                                                                                                                                                               |
| `yarn workspace @fluentui-react-native/components report:spec-source-drift --offline --write` and `check:spec-contracts`                           | **Passed:** report refreshed; 20 existing contracts validated. No new component contract was manufactured or approved.                                                                                                                                                                                                                                                                                                                                                                   |
| `yarn workspace @fluentui-react-native/native-core codegen:windows` and `codegen:windows --check`                                                  | **Passed.** Generated bindings committed; the C++ override takes `std::string` by value, matching codegen and FocusZone.                                                                                                                                                                                                                                                                                                                                                                 |
| `yarn build`                                                                                                                                       | **Passed:** repository project-reference build.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `storybook manifest --windows`, `--macos`, and `--win32`                                                                                           | **Passed.** Named test-bearing stories are included in strict story projects.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `storybook prep --windows` and `storybook build --windows`                                                                                         | **Passed:** RNW 0.81.35 Fabric Debug build.                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `storybook bundle --macos`                                                                                                                         | **Passed:** JavaScript/import check only, not an Apple native build. Windows/Win32 bundles also completed in their owned smoke pipelines.                                                                                                                                                                                                                                                                                                                                                |
| `storybook smoke --windows --mode stories-and-tests`, Callout selector                                                                             | **Executed:** 176 stories rendered; 11 cases, **3 passed / 8 skipped**. Only anchor-geometry cases passed; first/last/empty focus, dismissal input, operations and Menu focus remain unqualified.                                                                                                                                                                                                                                                                                        |
| Same Windows command, shared-focus selector                                                                                                        | **Executed:** 18 cases, **2 passed / 16 skipped**. New MenuItem native `menuitem`/disabled semantics passed; navigation and Input focus treatment skipped for unavailable physical-input capabilities.                                                                                                                                                                                                                                                                                   |
| `storybook smoke --win32 --mode stories-and-tests`, shared-focus selector                                                                          | **Executed:** 154 stories rendered; 18 cases, **2 passed / 16 skipped**. New MenuItem native semantics passed; physical behavior remains unqualified. This is not modern Win32 adapter admission.                                                                                                                                                                                                                                                                                        |
| `yarn check-agent-instructions`, `yarn change:check`, and `git diff --check`                                                                       | **Passed.** The new changeset must be staged for the release checker to discover it.                                                                                                                                                                                                                                                                                                                                                                                                     |
| `yarn clean-lage-cache` then `yarn lage buildci`                                                                                                   | **Failed:** root `lint-repo` reports 11 Knip unused-dependency findings in untouched experimental packages, apple-theme, and storybook-desktop-runtime. Constraints, alignment, lockfile, formatting, instruction/publishing/spec checks and package lints passed; 89 tasks passed, 80 remained pending. Failing workspaces and tooling have no diff from the baseline; a separate clean-baseline run was not performed this session. No unrelated dependencies were removed or ignored. |
| `yarn lage test` after that failure                                                                                                                | **Failed:** 37 tasks passed; the Storybook desktop task hit two 7s/10s worker deadlines under the aggregate run. The two affected contracts passed with `yarn workspace @fluentui-react-native/storybook-desktop test --runInBand --testNamePattern "representative desktop story tests                                                                                                                                                                                                  | executes isolated inline code"` (**2 passed**, 173 unrelated tests filtered). No tooling timeouts were changed, and the aggregate is not reported as green. |
| macOS Fabric/Paper native builds, R-APPLE-007 Office integration, real UIA/AX actions, Narrator/VoiceOver, and visual/high-contrast/scaling matrix | **Not run / unqualified:** requires the appropriate interactive/native consuming hosts. Mac bundle success and disabled-state inspection do not replace these gates.                                                                                                                                                                                                                                                                                                                     |

Owned Metro, channel, and driver listeners were shut down after each smoke
run; no listener remained on the recorded owned ports.

### macOS next steps (run both renderers)

1. Fetch this branch on the Mac, keep the desktop unlocked, and record the
   macOS/RNmacOS version and Keyboard navigation setting. Do not change privacy,
   keyboard, or certificate settings as a side effect of testing.
2. Run `yarn workspace @fluentui-react-native/agentic-components-storybook storybook prep --macos`,
   then `yarn workspace @fluentui-react-native/agentic-components-storybook storybook build --macos`.
   This regenerates Apple commands from the changed schema. Verify both the
   Fabric `requestFocus:requestId:targetTag:strategy:` forwarding selector and
   Paper's `requestFocus:generation:requestId:targetTag:strategy:` bridge against
   generated output; never hand-edit generated headers.
3. Run the R-APPLE-007 React-module and no-React-module Office bridging-header
   checks from `references/agents/native/apple-office.md`, including emitted
   Swift-header compatibility, extern registration syntax, qualified header
   lookup, and strict warnings/concurrency. A CocoaPods build is not Office
   qualification.
4. Generate `storybook manifest --macos` and run the native cases below through
   the declared Storybook workspace. These IDs were read from the generated
   manifest, not guessed: `native-modern-callout--first-focusable`,
   `native-modern-callout--last-focusable`, `native-modern-callout--empty-focus`,
   `native-modern-callout--keyboard-dismissal`, `native-modern-callout--default`,
   `native-modern-callout--menu-composition`,
   `native-modern-callout--menu-composition-focusing-trigger`,
   `components-menuitem--disabled-focusable`, and
   `components-input--focus-treatment`.
5. Re-run `prep --macos --paper`, then `build --macos --paper` and
   `smoke --macos --paper --mode stories-and-tests`. Re-prep before switching
   back to Fabric. Inspect case counts and skips in the structured reports.
6. Qualify first/last search and empty refusal without an inert FocusZone;
   explicit container fallback; precise Escape/outside/application-deactivation
   causes; no reopen after native dismissal; trigger ordering and guarded
   return; and disabled-focusable navigation without activation. Check actual
   AX disabled state and VoiceOver, especially Fabric's known projection gap.
7. Inspect outline/underline/error/read-only focus visuals at all three sizes,
   both themes and high contrast/backing scales: no second native editor ring,
   no clipping, no layout change, and the danger edge visible below the inset.
   The authored focus-treatment case checks real editor focus, scene visibility,
   and size stability, not pixel or speech conformance.
8. Finish P0's native menu hover-delay/intent and disabled-row convention probes,
   then the macOS family/owner-relative Tab and semantic fixes under #4377.
   Record results here and in the owning issue before approving the four
   component contracts. Stop owned Metro instances after every run.

### Windows next steps

Restore an interactive session whose runtime advertises physical input, then
finish the new Callout and shared-focus native lanes and
inspect their structured reports, not just the command exit. Qualify explicit
UIA actions/Narrator separately. After P0/P1, implement native family
transactions/guarded restoration and owner-relative Tab, geometry/DPI/scroll
fixes, and mounted-view menu-delay reporting. Continue P2 and then the complete
four pipelines in dependency order. Do not export them based only on a Windows
run; D01 still requires all four endpoints and the R1 exception only changes
Win32 Tab's destination.

Before release, reproduce/dispose the unchanged-workspace Knip findings and
rerun the final cache-cleared CI gate. Retry the deadline-sensitive Storybook
contracts with low contention; keep the passing targeted rerun distinct from a
passing aggregate and do not hide the repository lint failure.

### Win32 next steps

Run the new MenuItem/Input cases plus the existing legacy Callout baseline
against the actual prebuilt REX host. These do **not** qualify a modern adapter.
Implement the capability descriptor and adapter only after the section 5 probes
establish truthful readiness, initial-focus ordering, restoration, key
ownership, family behavior, and UIA projection. Implement the approved
close-and-return Tab interim without pretending it continues past the trigger.
Record failed B items, the A1 owner/release vehicle, and optional C capabilities
in #4384. Keep `/legacy` signatures and registration names unchanged.

## 13. macOS prerequisite continuation, October 17, 2026

This increment qualifies and repairs the independent prerequisites from section 12.
It does not implement or export Popover, Menu, MenuButton, or Dropdown, approve their
contracts, or complete macOS P0/P2. D01's all-endpoint release gate is unchanged.

### Implemented and observed

- A root Yarn resolution applies a reproducible patch to the already-resolved
  RNmacOS 0.81.9, without changing workspace dependency ranges. Fabric now uses
  the existing Paper AX role converter and projects disabled/selected/expanded
  state onto the actual accessible element. Native tests observe a disabled
  `menuitem`, enabled/disabled changes on the same row, selected-state changes,
  and expanded-state changes across popup open/close.
- Fabric's structural TextInput wrapper is no longer a second AppKit Tab stop.
  The single-line native editor keeps `editable=false` separate from disabled
  state on both renderers, remains selectable and focusable when read-only,
  refuses typing, and retains textbox semantics. Explicitly disabled editors
  remain disabled and are skipped. Input keeps its reviewed API and styling.
- Paper Callout view creation now asserts the UI-thread context through
  `MainActor.assumeIsolated`, using the existing narrowly scoped manager handoff.
  Complete concurrency checking exposed the original unisolated initializer
  call; the repaired source compiles in both React-module and no-React-module
  bridging configurations.
- Callout has a native explicit-empty-container focus probe. Its three geometry
  cases now execute on macOS, using the owned popup window and converting the
  driver's owner-relative element bounds to screen coordinates. No driver API,
  privacy setting, synthetic focus confirmation, or geometry tolerance was weakened.
- Disabled-row tests use physical pointer actions for refusal checks rather
  than asking WebDriver's element-click command to activate a disabled element.
  They also exercise Enter/Space refusal and native navigation away afterward.

**Renderer integration boundary:** the RNmacOS fixes are a repository-local
dependency patch, not a published native-core/components implementation of
missing renderer semantics. Upstream or equivalent consuming-renderer integration
is required before release; an Office Swift compile probe does not apply that
patch to an Office host. No Office runtime, VoiceOver, checked-action, or
cross-window relationship qualification is implied.

### Executed evidence

Environment: macOS 27.0.1 (26A434), arm64, RNmacOS 0.81.9 with the checked-in
patch, Xcode 26.4.1 (17E202), Swift 6.3.1. The desktop was unlocked and on-console;
Accessibility, event-posting and screen-capture preflights were available.
`AppleKeyboardUIMode=3` (Keyboard navigation enabled). No privacy, keyboard,
certificate, or VoiceOver setting was changed.

All app commands below use
`yarn workspace @fluentui-react-native/agentic-components-storybook`.
Both smoke selections use `STORYBOOK_SMOKE_TAG=story`; their exact
`STORYBOOK_SMOKE_STORY` values are shown.

| Check                                                                                                                                                                       | Result                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `storybook prep --macos`, clean generated DerivedData, then `storybook build --macos`                                                                                       | **Passed.** The build used the persisted RNmacOS patch, not a modified installed/generated source.                                                                                                                                                                                                                                                                                                                                          |
| `storybook smoke --macos --mode stories-and-tests`, `native-modern-callout--*`                                                                                              | **Passed: 12/12, zero skips.** First/last/empty/container focus, operations, Escape/outside dismissal and rearm, view/rect/point geometry, Menu composition, trigger restoration and expanded-state changes.                                                                                                                                                                                                                                |
| Same Fabric command, `components-*--*focus*`                                                                                                                                | **Passed: 19/19, zero skips.** Includes Input editor focus, read-only edit refusal, no focus-induced size change, disabled MenuItem physical/keyboard refusal and availability changes, Button disabled state, and TabList selected-state updates.                                                                                                                                                                                          |
| `storybook prep --macos --paper`, then `storybook build --macos --paper`                                                                                                    | **Passed.** Re-generated architecture-specific native projects and Pods before switching renderers.                                                                                                                                                                                                                                                                                                                                         |
| `storybook smoke --macos --paper --mode stories-and-tests`, same two selectors                                                                                              | **Passed: 12/12 Callout and 19/19 shared-focus, zero skips.** Each smoke rendered 184 stories before the selected cases.                                                                                                                                                                                                                                                                                                                    |
| `yarn workspace @fluentui-react-native/native-core test:apple-integration`                                                                                                  | **Passed in both prepared renderer configurations.** Complete Swift concurrency/warnings-as-errors, explicit React import, verified no-React-module bridge, emitted Swift header, both Paper registrations, strict unused-parameter/case diagnostics. The importer excludes only two existing RNmacOS umbrella-header diagnostics; FURN Swift/extern warnings remain errors. This is a source integration probe, not an Office runtime run. |
| `yarn workspace @fluentui-react-native/native-core test` and `lint`                                                                                                         | **Passed:** 18 ownership/entrypoint tests, 37 Jest tests, strict stories, package build and lint.                                                                                                                                                                                                                                                                                                                                           |
| `yarn workspace @fluentui-react-native/components test` and `lint`                                                                                                          | **Passed:** 484 tests, 8 snapshots, 20 reviewed contracts, strict stories and lint.                                                                                                                                                                                                                                                                                                                                                         |
| `yarn build`, app `lint`, `storybook bundle --macos`, package `format`, `yarn check-agent-instructions`, `git diff --check`                                                 | **Passed.**                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `yarn clean-lage-cache` then `yarn lage buildci`                                                                                                                            | **Passed: 171 tasks, zero skipped/pending/aborted/failed.** Repository lint (including Knip), formatting, publishing/instruction/contract checks, build, tests and package lints all executed. The Windows handoff's Knip/deadline failures did not reproduce in this macOS aggregate; no unrelated dependency or timeout change was made.                                                                                                  |
| Windows Fabric/Office Win32 execution in this continuation                                                                                                                  | **Not run:** no Windows host on this Mac; October 16 evidence and outstanding gates remain in section 12.                                                                                                                                                                                                                                                                                                                                   |
| AX action invocation/VoiceOver, native-menu hover timing/intent, application-deactivation input, visual/theme/high-contrast/scaling matrix and Keyboard navigation disabled | **Not run / unqualified.** Native state reads and passing focus geometry are not substitutes.                                                                                                                                                                                                                                                                                                                                               |

Ignored evidence is retained under
`apps/storybook/artifacts/macos/menu-popover-fabric-20261017/wdio` and
`menu-popover-paper-20261017/wdio`; command logs remain under
`apps/storybook/artifacts/storybook-commands`. The owned channel, Metro and driver
listeners on 26497/33589/40580 were absent after cleanup. The last prepared
renderer is Paper; rerun `prep --macos` before returning to Fabric.

### Remaining macOS work

Complete the named P0 manual/native-menu/assistive-technology probes, then the
generation-scoped popup-family transactions, guarded restoration, owner-relative
Tab continuation, submenu intent, and remaining semantic/geometry cases under
#4377/#4375. Carry the renderer fixes upstream or into each actual consuming host.
Only after the normal source-backed pre-code reviews should the four higher-order
component pipelines proceed. Flat composition and this native prerequisite
qualification do not authorize a macOS-only release or close any of those issues.
