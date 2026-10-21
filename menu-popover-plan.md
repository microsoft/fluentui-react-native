# Popover, Menu, MenuButton, and Dropdown: remaining work and PR notes

**Status:** October 21, 2026. Popover (#4236), Menu (#4232), MenuButton (#4231), and Dropdown (#4224) are implemented
from owner-approved contracts and pass their Storybook native cases on macOS Fabric, macOS Paper, Windows Fabric, and
Office Win32. None is exported from the package root yet. This file keeps only the open gates and the decisions that
still govern them, followed by notes for the pull request. The component contracts (`SPEC.md` and `spec/` in each
component folder) are the authority for behavior; the implementation history lives in the branch commits.

**Branch:** `user/jasonvmo/menu-popover`, based on `microsoft/fluentui-react-native` commit
`e2092f9df3fd4fafc141c696ca0e49e690d69cd1` (#4381).

## 1. Remaining work

### Before the root exports

D01 allows a public export only when a component meets its acceptance on all four endpoints. Storybook native cases
now pass everywhere; these gates remain.

- **Windows rerun of the latest Dropdown cases.** The macOS pass changed or added Dropdown story cases that have not run
  on Windows Fabric or Office Win32: "exposes a named list" now closes with a trigger click, LongList commits by
  clicking its option, and two new cases cover Tab and Shift+Tab (DRP-009; Win32 expects the trigger after Tab, per
  R1). The list also requests scrollers only while it overflows. Run `components-dropdown--*` and
  `components-listboxitem--*` on both Windows endpoints.
- **Screen readers.** VoiceOver and Narrator qualification of every component, including accessibility-action
  invocation (expand, collapse, select, add, and remove), announcements of disabled and selected state, and the
  combobox value. Native state reads in the story cases do not substitute for this.
- **Visual matrix.** High contrast, text scaling, dark theme, and the macOS "Keyboard navigation" off setting. Driver
  captures exclude window shadows, so popup elevation is verified by eye only.
- **Lifecycle ratification.** Popover, Menu, MenuButton, Dropdown, MenuItem, ListboxItem, and Input stay
  `contract-reviewed`. Ratify each to `implemented` once its export gate passes, and refresh readiness under #4216
  and #4251.
- **Root exports** of the four components, with their changesets moved from "not exported" wording.

### Deferred divergences and follow-up issues

| Item                             | Components                | Tracking                                                                                                                                                                                                                                  |
| -------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner-relative Tab and Shift+Tab | Popover, Menu, Dropdown   | #4377. Shift+Tab from a list or menu focuses the trigger instead of the view before it.                                                                                                                                                   |
| Edge margins                     | Popover, Menu, Dropdown   | #4375. Native clamping aligns popups with the work-area edge without a margin.                                                                                                                                                            |
| Submenu intent on macOS          | Menu                      | `menu-submenu-intent`: hover switching is delay-only; add a native pointer-travel signal.                                                                                                                                                 |
| Motion and the Popover arrow     | All                       | Presentation is instant, which equals reduced motion. Revisit when Flex motion is final.                                                                                                                                                  |
| Context menus and point anchors  | Menu                      | #4383 (D13).                                                                                                                                                                                                                              |
| Office Win32 host improvements   | All                       | #4384 (R1, R3): honor `gapSpace`, per-pixel transparency, classified dismissals, FocusZone Home and End, trigger restoration on close, Tab past the owner, and one pointer enter without a leave. Each lets an adapter drop a workaround. |
| Dropdown tag strip               | Dropdown                  | `dropdown-token-strip`: needs a reviewed Tag-based design.                                                                                                                                                                                |
| RNmacOS renderer patch           | MenuItem, Input, Dropdown | The root Yarn patch to RNmacOS 0.81.9 (Fabric AX roles and state, TextInput Tab stop, read-only editor) must go upstream or into each consuming host before release.                                                                      |
| Office Apple runtime             | All                       | `test:apple-integration` is a source probe; no Office runtime has run these components.                                                                                                                                                   |
| Controlled close veto            | Popover                   | A caller that vetoes a trigger close keeps a stale close cause until the next open; recorded, not observed natively.                                                                                                                      |
| Win32 popup shadow               | All                       | A one-pixel shadow artifact can appear at a bottom corner of the Win32 popup.                                                                                                                                                             |

### Known pre-existing failures

- Windows `lint-repo` (Knip): `knip.config.ts` builds workspace keys with backslashes, so imported dependencies in
  unchanged packages read as unused. It passes on macOS.
- Windows `components-input--focus-treatment` failed before this work.
- The Windows node test controller occasionally exits with 0xC0000409 after the Dropdown Default story while the app
  stays responsive; reruns pass.

## 2. Decisions that still apply

The owner confirmed D01 to D14 on October 16 and R1 to R3 before implementation. These still constrain the remaining
work:

| ID  | Decision                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D01 | All four endpoints ship together. A preview label may limit features, never platforms.                                                                       |
| D02 | Native-core is a relied-upon dependency. `/legacy` stays stable; modern APIs are experimental. Native-core never depends on Design.                          |
| D03 | Native presence is authoritative, with a latch and rearm. Dismissal causes are truthful at the native boundary and coarse (`trigger`, `dismiss`) at the API. |
| D06 | MenuItems may stay focusable while disabled; R2 makes that the Menu default on Windows and Win32 and opt-in on macOS.                                        |
| D09 | Dropdown options take real focus (no active descendant), and the trigger keeps its focused chrome while the list is open.                                    |
| D13 | Secondary-click opening and point anchors are deferred to #4383.                                                                                             |
| D14 | After an outside click, keep a newly focused control; otherwise return focus to the trigger.                                                                 |
| R1  | On Win32, Tab closes the popup and returns to its trigger until #4384 supports continuation.                                                                 |

## 3. PR notes

### Summary

- **Popover (#4236):** a Button trigger slot and a token-styled surface in native-core's modern Callout, with
  controlled or uncontrolled presence, entry focus on the first eligible content or a fallback surface stop, and focus
  return on Escape or caller close.
- **Menu (#4232) and MenuButton (#4231):** a shared popup family with two-level submenus declared through MenuItem's
  `submenu` prop, hover-open with platform delays, type-ahead, Home and End, discoverable disabled rows (R2), and native
  Tab continuation. MenuButton composes Button with a static chevron.
- **Dropdown (#4224):** a `combobox` trigger with Input's outline or underline chrome opens a `list` of ListboxItem
  options, with single or multiple selection, controlled or uncontrolled selection and presence, a placeholder, and a
  count summary. ListboxItem gains a `value` prop that binds it to the list.
- **Native-core:** the modern Callout gained `first` and `last` entry focus, truthful dismissal reasons,
  `tabNavigation` with the `tab-forward` and `tab-backward` reasons, transparent content-drawn surfaces, nested-popup
  close and light-dismiss rules, and Paper command ordering through UI-manager blocks. Windows Fabric gained rounded
  popup windows with platform shadows, anchor-press handling, and a Tab message hook. New `/win32` Callout and
  FocusZone adapters target the Office host's legacy registrations.
- **Framework Base and leaves:** `disabledFocusable` for MenuItem, Input's variant focus treatment, and shared
  `triggerExpandActions` that declare Win32 Expand and Collapse.
- **Desktop driver:** Windows window activation accepts owned popups, subtree walks retry on closing popups, and
  layout characters type as virtual keys.

### Findings worth reviewing

- Yoga's default errata let `flexGrow` rows fill a fit-content popup to the window width. Menu and Dropdown size their
  content with a row wrapper that uses `overflow: 'scroll'`, and host nested popups in a wide absolute View.
- Callout's popup-wide `first`/`last` search stops at a focusable FocusZone, so Menu entry focus uses FocusZone
  commands.
- macOS Paper insets ScrollView content by the size of legacy scrollers (the style used while a mouse is attached),
  even while they are hidden. The Dropdown list therefore never requests a horizontal scroller and requests a vertical
  one only while its options overflow. Before this, Paper options were 17 points narrower than the list and the list
  was 17 points taller than its options. Fabric always uses overlay scrollers.
- RNW's portal lays out its child as a layout root, so Dropdown's trigger-width floor is a zero-height child rather
  than `minWidth`.
- macOS driver: `switchToWindow` makes the owner window key, so story cases send keys before reading popup semantics,
  or act with the pointer inside the popup.

### Validation: macOS, October 21, 2026

macOS 27.0.1 (26A434), arm64, Xcode 26.4.1, Swift 6.3.1, RNmacOS 0.81.9 with the checked-in patch, Keyboard navigation
on (`AppleKeyboardUIMode=3`). Storybook commands use
`yarn workspace @fluentui-react-native/agentic-components-storybook` with `STORYBOOK_SMOKE_TAG=story`.

| Check                                                                                         | Result                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fabric `storybook prep --macos`, `build --macos`, `smoke --macos --mode stories-and-tests`    | **Passed, zero skips:** Dropdown 8/8, Menu 8/8, MenuButton 4/4, MenuItem 3/3, Popover 5/5, `native-modern-callout` 16/16, `native-callout` 2/2, `native-modern-focuszone` 4/4, `components-*--*focus*` 16/16; 199 stories rendered. |
| Paper `prep --macos --paper`, `build --macos --paper`, then the same selectors with `--paper` | **Passed, zero skips:** the same counts. One `native-modern-callout` run hit a driver pointer-move error; the rerun passed 16/16.                                                                                                   |
| Dropdown list measurement after the scroller fix, both renderers                              | **Observed:** a 240×250 list with 230-point-wide, 40-point-tall options inside 4-point padding and a 1-point border.                                                                                                                |
| Driver captures of the Dropdown trigger gallery, the open list, and the focus ring            | **Observed:** outline and underline, sizes, selected, error, and disabled triggers render correctly; the ring is correct once its animation settles.                                                                                |
| `yarn workspace @fluentui-react-native/native-core test:apple-integration`                    | **Passed.**                                                                                                                                                                                                                         |
| Components `test`, `lint`, `check:spec-contracts`                                             | **Passed:** 66 suites, 561 tests, 8 snapshots.                                                                                                                                                                                      |
| `yarn clean-lage-cache` then `yarn lage buildci`                                              | **Passed:** 171 tasks, zero skipped, pending, aborted, or failed; also `storybook bundle --macos`, app `lint`, `yarn check-agent-instructions`, `yarn change:check`, `git diff --check`.                                            |
| ListboxItem story cases                                                                       | **None defined;** its stories render. LBI-006 runs through the Dropdown cases.                                                                                                                                                      |

### Validation: Windows Fabric and Office Win32, October 19 to 21, 2026

| Check                                                                                   | Result                                                                                                                                                                   |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Windows `smoke --windows`, Menu, MenuButton, MenuItem, Popover, Callout, and FocusZone  | **Passed:** Menu 8/8, MenuButton 4/4, MenuItem 3/3, Popover 5/5, `native-callout` 2/2, `native-modern-callout` 16/16, `native-modern-focuszone` 4/4.                     |
| Win32 `smoke --win32`, Menu family, Popover, and `native-callout`                       | **Passed:** Menu 8/8, MenuButton 4/4, MenuItem 3/3, Popover 5/5, Callout 2/2.                                                                                            |
| `desktop-focus` cases on Menu, MenuButton, MenuItem, Popover, ListboxItem, and Dropdown | **Passed:** 26/26 on Windows Fabric and 26/26 on Office Win32, before the macOS changes to the Dropdown cases.                                                           |
| Components, native-core, and desktop-driver `lint` and `test`; `check:spec-contracts`   | **Passed:** components 560 tests; native-core 18 ownership and 56 Jest tests; driver 61 with 3 skipped.                                                                  |
| `yarn clean-lage-cache` then `yarn lage buildci`                                        | **Knip failed, pre-existing on Windows** (backslash workspace keys). Every other target passed; a deadline-sensitive storybook-desktop contract passed when rerun alone. |

### Not run

- The new and changed Dropdown story cases on Windows Fabric and Office Win32.
- VoiceOver, Narrator, and accessibility-action invocation on any endpoint.
- Office runtime hosts on macOS; the high-contrast, scaling, and theme matrix.
