# Storybook test components and agentic Win32 UX

**Status:** Reconciled implementation plan, not an implementation or ratified component contract.
**Date:** October 26, 2026.
**Baseline:** `8fb422f81`, branch `user/jasonvmo/storybook-test-components`.

## 1. Outcome and scope

Create a runtime-safe `@fluentui-react-native/components/test` entry point, consolidate shared story UI, move the
generic theme-testing host and picker there, and use agentic components throughout the runtime-owned Win32 UX.
Preserve Storybook navigation, native popup ownership, authentication/readiness, and existing platform boundaries.

| Goal                                              | Planned deliverable                                                                                      | Completion evidence                                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1. Export a `test` submodule with local contracts | Five explicitly exported components under `components\src\test`, each with `CONTRACT.md`                 | Public-subpath consumer build; packed source, JS, declarations and contracts; reviewed requirements |
| 2. Unify common story/test components             | One StoryStatus implementation, 19 compatible StoryGroup wrappers, five compatible StoryItem wrappers    | Migrated consumers preserve geometry, IDs, interactions and native accessibility                    |
| 3. Runtime depends on components                  | Production workspace dependency, TS reference and required peer provisioning                             | Acyclic workspace/reference graph, publishing checks and three desktop bundles                      |
| 4. Move the theme tester                          | Generic host becomes ThemeTester; runtime keeps a thin ID/config adapter                                 | Existing root, background, mount-identity and theme regression tests retained                       |
| 5. Move and modernize the picker                  | ThemePicker uses Dropdown/ListboxItem for Flex/Fluent and Light/Dark, retaining System and high contrast | Controlled-state tests plus actual native selection/focus/accessibility evidence                    |
| 6. Agentic Win32 UX                               | Agentic toolbar, story navigation/search, addon tabs/headings and accessible resize controls             | Win32 unit/model tests and REX-native shell/navigation/popup acceptance                             |

Goal 6 includes replacing **both** upstream Sidebar presentations in the Win32 override. Replacing only toolbar
buttons would leave story search and navigation outside the requested migration. Third-party addon bodies remain
third-party; macOS/Windows continue using upstream LiteUI.

No product Accordion/ListItem fixes, native protocol changes, mobile redesign, new workspace, generic tree product,
test runner extraction or wholesale theme-engine rewrite are included. A genuine Flex-dark palette gap is an explicit
acceptance gate below, not something to disguise with invented colors.

## 2. Evidence and important corrections

Path abbreviations used below:

| Prefix | Repository-relative directory                |
| ------ | -------------------------------------------- |
| C      | `packages\agentic\components`                |
| R      | `packages\agentic\storybook-desktop-runtime` |
| S      | `packages\agentic\storybook-desktop`         |
| D      | `packages\agentic\design`                    |
| A      | `apps\storybook`                             |

**Observed:**

- There is no tracked agentic `ThemeTester` symbol. The relevant host is `StorybookThemeHost` and its private
  `StorybookThemeContent` in `R\src\StorybookTheme.tsx:25-73`; the factory mounts it at
  `R\src\createDesktopStorybookApp.tsx:40-48`. Introducing the requested name is an extraction/new public API, not a
  literal existing-file rename. The unrelated v0 `ThemeTest` in `apps\tester-core` is excluded.
- C currently exposes root and primitives entry points, not `/test` (`C\package.json:32-45`).
  `C\tsconfig.json:9-10` excludes stories, `*.story-helpers.tsx` and WDIO helpers from production emit. Exported test UI
  needs ordinary source filenames.
- The current picker mixes unrelated axes: omitted theme means default/inherited Flex, while Light/Dark/High Contrast
  select legacy Fluent sources (`R\src\StorybookTheme.tsx:15-35`). These are not Flex palette variants.
- Omitted theme inherits the parent source and requested appearance; an explicit Flex source does not. Scene modality
  sharing is a separate guarantee (`D\src\theming\ThemedRoot.tsx:15-19,30-53`).
- Stock Flex token values currently do not vary with appearance
  (`D\src\theming\flexThemeReference.ts:137-142`; `D\references\remaining-work.md:36-43`, #4263).
  Changing resolved appearance metadata alone does not demonstrate dark pixels.
- Dropdown already has reviewed desktop behavior and a Win32 popup adapter
  (`C\src\components\dropdown\SPEC.md:138-204`; `C\src\common\popupHost.win32.ts:3-18`).
  Reuse it rather than authoring another popup/native protocol.
- R's production dependencies and references omit C. C already uses S for development/story tooling, but S currently
  has no runtime dependency/reference back to R. Both investigators found the proposed R-to-C direction feasible;
  that does not authorize introducing C-to-R story imports.
- C requires `react-native-svg`; R does not currently provision that peer, although A already installs it
  (`C\package.json:84-91`; `R\package.json:73-81`; `A\package.json:24-35`).
- Windows/Win32 story-pattern overrides replace defaults; adding files alone will not discover the new category
  (`A\desktop.config.mts:31-37`; `S\src\config\makeDesktopStorybookConfig.ts:348-359`).
- The existing contract checker enumerates HOC `SPEC.md` files, not primitive/new test `CONTRACT.md` files
  (`C\scripts\spec-contracts\common.cjs:7,58-64`). Do not claim existing automation validates the new local contracts.

**Proposed decisions:** Extract five small composed test/demo components, keep application-specific state/models above
them, and preserve initial inherited-theme behavior rather than silently changing nested consumers. Exact contracts
are reviewed before implementation; this plan does not promote them to implemented/reviewed status.

## 3. Public submodule, contracts and dependency boundary

### Structure and exports

```text
packages\agentic\components\src\test\
  index.ts
  theme-tester\
  theme-picker\
  story-group\
  story-item\
  story-status\
```

Each component directory contains `CONTRACT.md`, its implementation, small public types, focused tests and a
colocated story. Separate styles/types files only where useful; do not generate a six-stage HOC pipeline for a caption
wrapper. Receive/forward stable native root refs through React 19 ref props, not new `forwardRef` wrappers.

Add a `./test` export matching primitives' conditions: types at `./lib/test/index.d.ts`, React Native/default at
`./src/test/index.ts`, and import at `./lib/test/index.js`. These are package-export targets, not filesystem commands.
Use explicit named value/type exports. Root and primitives must not re-export `/test`.

This is a third category: **composed, potentially themed, runtime-safe test/demo UI**. It is not unstyled primitives
and not a bundle of Jest, RNTL, Node or WDIO utilities.

| Component   | Contract boundary                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| ThemeTester | Generic theme selection/source/provider and content layout; stable child/root identity; one owned theme boundary |
| ThemePicker | Controlled selection UI only; named Dropdowns; no provider, persistence or runtime configuration                 |
| StoryGroup  | Caption, then one content container; caller-controlled geometry and optional label marker                        |
| StoryItem   | Children, then caption; caller controls sample width and caption styling                                         |
| StoryStatus | One named accessible native View with decorative inner text; exact status/testID observability                   |

Contracts follow the local prose precedent in `C\src\primitives\icon\CONTRACT.md` and
`C\src\primitives\layout-stable-text\CONTRACT.md`, without weakening primitive invariants or fabricating Flex provenance.
Give requirements stable IDs and specify props/defaults, owned semantics, refs, child order, style precedence,
state/callback ownership, ID derivation, accessibility, platform differences and planned test evidence.

Add `C\references\test-components.md`; update C's AGENTS, README entry-point table, reference index, source boundaries,
contributing and tests/contracts guidance. Keep guidance in the owning package, not duplicated in root skills.

Include only a **small contract-presence/export-inventory guard** in existing tooling, with missing-contract negative
coverage. Define its catalog convention in the new reference first. Do not build a Markdown schema/provenance engine,
retrofit primitive contracts, change Flex drift reports, or describe the HOC checker alone as proof of `/test` coverage.

### Permitted direction

```text
storybook-desktop-runtime -> components/test -> component/primitive leaf implementations
                                            -> design / framework-base / public native-core adapters
app integration fixtures -> runtime + components
component WDIO callbacks -> storybook-desktop/testing and callback-local Node helpers
```

Keep `/test` implementation imports downward and relative to C's component leaves, not its aggregate root. Never add
C-to-R/A dependencies, including development/type-only shortcuts that create a TS-reference cycle. Leave superficially
similar native-core story helpers local: native-core-to-C would invert the existing lower-layer direction.

Add R's components production dependency and `..\components\tsconfig.json` reference. Propagate SVG peer, development
binding and applicable alignment capability. Declare framework-base directly if runtime focus helpers are consumed.
For fuzzy navigation, declare the already locked microfuzz package directly rather than reaching through a transitive
dependency; retain the existing locked version and apply the repository's package-age policy without broad upgrades.
Remove R's default-theme dependency/reference only after its last import is gone; retain native-core for the portal.

No new root TS project is necessary. Refresh Yarn/lockfile after manifest changes, inspect production/development/story
and TS-reference graphs, and verify packed files. `check-publishing` can rewrite manifests before failing
(`scripts\src\utils\checkDependencies.ts:96-109`); it is not a read-only discovery probe.

## 4. Theme host and picker design

### Host ownership and default compatibility

Move generic host/state/theme-source/content behavior from `R\src\StorybookTheme.tsx` to ThemeTester. Retain
`StorybookThemeHost` as a small adapter supplying runtime-prefixed IDs. Its existing factory import can stay unchanged.
Do not move runtime configuration hooks, bridge readiness, storage, app identity or Storybook color conversion into C.

ThemeTester replaces the runtime's old provider; the adapter must not add another ThemedRoot around it. The outer
runtime root encompasses picker, bridge, chrome and preview. Deliberate nested ThemeTester examples may own another
theme boundary while sharing scene input modality; "one scene" does not forbid every nested ThemedRoot.

**Conservative proposed default contract:** Preserve the old initial omitted-theme inheritance. Represent inherited
selection explicitly rather than calling an arbitrary ambient theme "Default Flex". The source Dropdown offers
`Inherited theme`, `Flex default` and `Fluent default`; explicit choices create genuine default-source boundaries.
System/Light/Dark and contrast selectors apply to explicit sources. In inherited mode they show an inherited state
and do not silently override the parent's request.

Use a discriminated selection: an inherited variant, or an explicit Flex/Fluent variant carrying design's
`ThemeAppearanceRequest`. On the first explicit selection initialize System requests; thereafter source changes preserve
requested appearance. Returning to inherited selection omits both source and appearance overrides. Contract review
must finalize that small API before code. An explicit-Flex initial default instead would require owner approval of the
nested-theme compatibility change; do not slip it into the migration.

ThemePicker is controlled (`value`/`onValueChange`); ThemeTester supports controlled and default-value ownership.
No unconstrained picker-props escape hatch, competing appearance/theme props, or speculative `showPicker` option.
Use the existing record-capable controllable-value hook, compare fields for no-op changes, and notify exactly once.
Controlled views do not optimistically change when their owner declines an update.

### Choices, sources and appearance acceptance

- Explicit source choices: Flex default and Fluent default.
- Explicit scheme choices: System, Light, Dark.
- Contrast choices: System, Standard, High Contrast. Keep this third Dropdown so the existing high-contrast path is not
  removed. Preserve `interfaceLevel` when editing another appearance axis; no new interface-level UI is required.
- ThemePicker uses actual `selectedOptions`/`onSelectedOptionsChange` and direct ListboxItem children with unique string
  values. Validate empty/unknown returned selections; do not cast arbitrary arrays into state.
- Name controls "Theme source", "Color scheme" and "Contrast". Selected text is not an accessible name. Provide stable
  caller-derived root/trigger/option IDs; do not hardcode the app prefix or collide across instances.
- Use stable default Flex/legacy references and public design defaults APIs. Fluent defaults can use an appearance-aware
  ThemeReference recipe plus `design/theming/compat/defaults`; default-theme delegates to the same API
  (`packages\theming\default-theme\src\defaultTheme.ts:1-19`). No new default-theme dependency in C, palette copies,
  production `design/testing` imports, global `.update()` mutations or theme-keyed remounts.
- Read content styles/tokens below the provider. Keep native ColorValue tokens in native controls; R retains
  `useStorybookTheme`'s literal-color fallbacks for upstream JS utilities.

| Configuration                                    | Required claim/evidence                                                                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Inherited initial selection                      | Parent source and requested appearance remain inherited, including a custom/fixed-appearance parent                        |
| Fluent Light/Dark/High Contrast                  | Actual existing palettes and synchronized chrome/preview colors, not metadata alone                                        |
| Explicit Flex Light/Dark/High Contrast today     | Correct requested/resolved appearance, with documented current invariant token values                                      |
| Genuine appearance-specific Flex-default visuals | **Blocked on separately reviewed design-default work for #4263, unless the owner explicitly accepts the limited behavior** |

Do not mark the full visual-mode goal complete merely because Flex's metadata says Dark. Before implementation,
settle whether genuine Flex dark/high-contrast visuals are required now. Recommended acceptance treats that stronger
claim as a design prerequisite, not fabricated UI colors or a silent switch to Fluent.

Allow constrained selectors and toolbar wrapping. Delegate popup focus, scrolling, dismissal and UIA actions to
Dropdown. Preserve its Win32 differences: popup gap is ignored, and Tab/Shift+Tab dismiss back to the trigger
(`C\src\components\dropdown\SPEC.md:193-204`). No popup rewrite is part of this move.

## 5. Finite shared-story migration

Move `C\src\common\StoryStatus.story-helpers.tsx` to the emitted StoryStatus implementation, preserving its accessible
View/text relationship and every existing probe ID/value. Update all 13 clients:
Avatar, Button, Dropdown, Input, Menu, MenuButton, MenuItem, Popover, Skeleton, Spinner, Switch, TabList and primitive
LayoutStableText stories. Delete the old helper only after imports/docs move.

Replace these compatible definitions under `C\src`; preserve local root/content/caption styles and story exports:

| StoryGroup consumers                                                                                                                                                       | StoryItem consumers                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Accordion, Avatar, Badge, Button, Card, Checkbox, Divider, Input, ListItem, ListboxItem, MenuItem, ProgressBar, Radio, Skeleton, Spinner, Switch, Tab, Tag, primitive Icon | Skeleton, Spinner, Switch, primitive Icon, primitive CheckboxIndicator |

Evidence includes Button's labeled wrapper at `components\button\button.stories.tsx:25-38`,
Checkbox's column styles at `components\checkbox\checkbox.stories.tsx:221-233`, and Input's constrained column at
`components\input\input.stories.tsx:276-296`. A shared wrapper must not normalize all of them to a wrapping row.
Keep existing sample widths, including Icon/Spinner 56, Skeleton 72 and Switch 96, at their call sites.

Keep local:

- CompoundItemLayout's caption/direct-children group, which has no inner content wrapper
  (`primitives\compound-item-layout\compound-item-layout.stories.tsx:14-19`).
- LayoutStableText's label-first measured frame (`primitives\layout-stable-text\layout-stable-text.stories.tsx:18-23`).
- Modality, focus, geometry, animation and event probes; sample icons/data; component-specific state/scenarios.
- Private Jest render fixtures, WDIO window/focus helpers and Node imports.
- Runtime story-index models, addon registration, storage and all channel/app configuration.

Agentic Text may intentionally improve theme-aware captions, but preserve explicit typography and review the resulting
dark/high-contrast presentation. Do not describe that presentation change as pixel-identical mechanical extraction.

## 6. Win32 UX implementation

### Shell, navigation and addon presentation

Keep `R\src\StorybookUI.ts` unchanged as upstream LiteUI. Change the `.win32` implementation and private Win32 helpers.
Use the existing prefix-only helper naming convention, for example `Win32StoryNavigator.tsx`, imported only by the
Win32 override; avoid introducing an unresolved suffix-only TS import or changing global moduleSuffixes.

| Surface              | Agentic composition and retained ownership                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| Toolbar/pane actions | Button/Text for show/hide, popout/close, current story and headings; retain native target refs and action IDs |
| Both Sidebar mounts  | Runtime-private navigator using Input/Button/Text, Storybook index/raw IDs and public nonvisual helpers       |
| Addon header         | Controlled TabList/Tab, close Button, existing horizontal header scroller                                     |
| Addon body           | Existing separately constrained vertical scroller, story-ID-keyed content and third-party `panel.render`      |
| Resize               | Existing drag/PanResponder plus named decrement/increment Buttons using the same clamped state                |
| Popouts              | Existing `Win32CalloutPortal`, legacy host adapter, RootInputBoundary, dismissal and ownership                |

Preserve sidebar initial width 280/bounds 200-480 and addon initial height 280/bounds 160-520
(`R\src\StorybookUI.win32.tsx:21-23,60-65`). Do not introduce cross-launch persistence.
Do not use Button's checked-toggle `selected` contract indiscriminately for expanded panes/navigation.

For navigation, write an original renderer, not copied upstream styled source. Preserve actual index order/hierarchy,
single-story hoisting, expansion/collapse/all, fuzzy name/path search, bounded results/show-more, no-results/empty
catalogs and raw-ID story selection. Selection exits search presentation; it need not erase the query.
Keep external story selection synchronized and use stable raw IDs, not label-derived slugs.

Use a measured vertical **ScrollView** initially for the bounded catalog, with mounted rows and layout records.
Expand selected ancestors, wait for their layout, then reveal the selected row. Explicitly own/cancel pending
scroll/focus requests across query/catalog/presentation changes. Do not copy upstream fixed heights to token-sized
Buttons. Virtualization is deferred unless scale measurements justify its additional offscreen-focus/retry contract.

Hoist query/expansion state above inline/popout presenters so the new implementation retains it across pane moves.
This and reliable selected-row reveal are **introduced requirements**, not proven current Win32 parity: the current
conditional Sidebar mounts own separate local state and do not establish LiteUI's selected-node provider path.
Do not add a recent-history feature; peer review found the installed search's recent-history path unpopulated.

Use labeled branch/story Buttons without claiming an unimplemented native Tree pattern. Win32 branch expansion needs
explicit supported Expand/Collapse accessibility actions and idempotent handlers; `accessibilityState.expanded` alone
does not establish this host's UIA pattern (`C\src\common\triggerExpandActions.win32.ts:5-30`).
Implement transport runtime-locally, not by importing that private C helper. Keep Button's existing press activation;
do not add duplicate Enter/Space handlers. Verify actual current-row announcements rather than assuming Button gets
SelectionItem semantics. Input retains native editing/IME/modifier behavior.

Addon TabList owns selection/roving focus, not scrolling. Retain its header ScrollView, reveal focused tabs through
measured native scrolling without a competing arrow handler, and preserve the vertical body scroller. Use real matching
native identity for Tab `controls` relationships, not an assumed equivalence with testID.
Preserve Actions-first preference, disabled-panel filtering, replacement if a selected addon disappears, and title
conversion (`R\src\Win32AddonsPanel.tsx:18-38,48-53,89-103`).

### Focus, resizing and observable compatibility

Define live focus recipients when hiding a pane, selecting a story that removes its popout trigger, closing addons or
returning inline. Use established framework-base/native focus handling and observe native confirmation; an optional
`.focus()` call is not proof. Do not steal focus after outside-click dismissal or deactivation.

Keep pointer drag with existing incremental deltas, clamps and release/termination cleanup. Named resize Buttons must
provide equivalent keyboard/AT operation, disabled at bounds. Do not retain a fake adjustable announcement solely for
automation, nor make a strip inaccessible without checking native lookup.

Preserve these app-prefixed native smoke markers from `S\config\smoke-win32.ps1:198-202`:

```text
win32-sidebar-header
win32-sidebar-resize
win32-addons-panel-header
win32-addons-resize
win32-addon-storybook-actions-panel
```

If a marker must move to a meaningful observable sibling, preserve its documented role/lookup or deliberately revise
the smoke contract with equivalent native evidence. React testID assertions alone are insufficient. Headers must not
group away their individual interactive children.

No new baked-REX protocol, codegen or native registration is assumed. A demonstrated missing capability becomes an
explicit blocker/native-skill follow-up, not a guessed command or readiness bypass.

## 7. Discovery and executable integration coverage

Add `src/test/**/*.stories.?(ts|tsx)` to **both** component-package Windows and Win32 overrides in
`A\desktop.config.mts`. Keep current Accordion and Win32 ListItem exclusions and native-core patterns.
macOS's existing default glob already covers the subtree. Update corresponding S config/discovery fixtures.

Use `Test/<Name>` as the new category without changing old story titles/exports/IDs. Add each WDIO-bearing new story's
exact path to `C\tsconfig.stories.json`; representative checking uses exact include membership
(`S\src\driver\representativePlans.contract.cjs:30-34`). Regenerate `storybook.requires.ts` only through declared scripts.

Add app-local `A\src\runtime-chrome.stories.tsx` and explicitly register `.` with a narrow pattern in app discovery.
The fixture contains an editor/counter, not another Storybook app/root/bridge. Its tests drive the **actual outer**
theme picker and Win32 chrome, proving retained preview state and authenticated readiness.
Standalone C/test stories cannot establish those global-shell guarantees.

Callbacks remain self-contained; WdioStory imports are type-only and Node helpers are literal dynamic imports inside
callbacks. Never export callback infrastructure through `/test`. Metro already supports subpath exports/symlinks;
no resolver alias appears necessary. Preserve Win32 fork mapping and Unicode-regex compatibility. Loading Metro config
generates the polyfill, so it is not a read-only planning probe.

A fresh named test recreates the preview, not global host/chrome state (`S\references\story-tests.md:46-55`).
Use `finally` to close popouts, restore original requested theme values, visibility, sizes, addon/query/expansion state
and release input. Wait for observed restoration and retain the original failure if cleanup also fails.

## 8. Implementation order and gates

| Phase / owner                          | Actions                                                                                                                                   | Exit gate                                                                                                                                  |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 0. Components/design/runtime contracts | Review five CONTRACTs; ratify host extraction, inherited default representation and ID/ref/state surfaces; resolve Flex visual acceptance | No guessed source identity, silent inherited-theme change or false Flex-dark claim                                                         |
| 1. Components submodule                | Add exports, emitted helpers, minimal local-contract guard, focused runtime/type tests and stories                                        | Real `/test` consumer resolves JS/types; helpers are runtime-safe and root/primitives stay separate                                        |
| 2. Components story consumers          | Apply finite 13/19/5 migration and remove superseded definitions                                                                          | Geometry, scenario behavior, native markers and old story IDs retained                                                                     |
| 3. Runtime integration                 | Add production edge/references/SVG provisioning; delegate theme host; remove unused default-theme edge                                    | One outer scene, nested inheritance tests, no story/UI remount, unchanged backgrounds/bridge; early Win32 root-import/bundle qualification |
| 4. Win32 runtime UX                    | Migrate shell, both navigators, tabs/scrollers and resize alternatives; retain portal and marker contracts                                | Tested data/state/focus ownership; no excluded component or fake UIA claim                                                                 |
| 5. App/integration owners              | Add discovery patterns/app fixture; regenerate through scripts; update guidance/agent map and test selectors                              | All intended story/case IDs present on every endpoint; global-state cleanup exercised                                                      |
| 6. Release/qualification               | Package checks, packed exports, native lanes, changesets, final root acceptance                                                           | Truthful per-check/per-endpoint evidence; unresolved native/design gates explicitly block stronger claims                                  |

Add a components minor changeset for the new public API and runtime patch changeset; use appropriate changesets for
other published packages whose shipped source/guidance changes. No changeset or implementation is created by this plan.
Keep app identity/native projects generated and app-owned. Reconcile stale design dependent-work notes without
claiming #4263 solved. Retire this requested cross-package planning artifact after delivery; ongoing package work
belongs in indexed `references\remaining-work.md`, with completed entries removed.

## 9. Validation plan

**Planning-session status:** Source inspection, two independent investigations and both reciprocal critiques completed.
Implementation tests, type/build/lint/format, contract checks, dependency/publishing checks, bundles, apps and native
qualification were **not run**. No source/manifests/native configuration were changed.

### Focused checks during implementation

Run owning scripts, after new files exist; no-match selectors are failures, not passes:

```powershell
yarn workspace @fluentui-react-native/components check:spec-contracts
yarn workspace @fluentui-react-native/components test theme-tester theme-picker story-group story-item story-status
yarn workspace @fluentui-react-native/components build
yarn workspace @fluentui-react-native/components test:stories
yarn workspace @fluentui-react-native/storybook-desktop-runtime test StorybookTheme useStorybookTheme Win32
yarn workspace @fluentui-react-native/storybook-desktop-runtime build
yarn workspace @fluentui-react-native/storybook-desktop test makeDesktopStorybookConfig representativePlans transformStoryTests
```

Retain existing runtime tests for one UI construction, stable scene/input controller and no child unmount;
explicit/transparent backgrounds; synchronized colors; source invalidation and opaque-native-color fallbacks.
Add inherited custom-parent tests separate from modality/ThemeState identity tests.

Cover real Dropdown selection, disabled/invalid/no-op/controlled updates, independent appearance fields, System changes,
actual Fluent palettes and honest Flex behavior. Cover refs, caption order/geometry and StoryStatus's named View.
Compile the actual public subpath; Jest transformation does not prove type assertions.

Win32-suffixed tests cover actual platform JSX alongside pure navigation models: nested/empty/changed indexes, duplicate
names with distinct IDs, search limits/clearing, selection/ancestry, layout/reveal lifecycle, pane moves, addon fallback,
resize clamps and portal refs. A base macOS Jest preset does not qualify Win32 resolution.

### App discovery and bundles

From `apps\storybook`:

```powershell
yarn storybook manifest --macos
yarn storybook manifest --windows
yarn storybook manifest --win32
yarn storybook test --win32 --list
yarn storybook bundle --win32
yarn storybook bundle --windows
yarn storybook bundle --macos
```

Inspect manifest-derived IDs/counts and exclusions. Qualify runtime root imports early: excluding an unsafe story from
rendering does not prove the aggregate component module is safe to import. Restart the owned app/Metro when the
require-context catalog changes; stop Metro after use. Bundles are not native qualification.

### Native lanes on the owning machines

After bundles exist, use declared lifecycle commands, not guessed native runners:

```powershell
# Windows Fabric
yarn storybook prep --windows
yarn storybook build --windows
yarn storybook --verbose smoke --windows --mode stories-and-tests
# Prebuilt Office Win32 Paper / REX
yarn storybook --verbose smoke --win32 --mode stories-and-tests
# macOS Fabric
yarn storybook prep --macos
yarn storybook build --macos
yarn storybook --verbose smoke --macos --mode stories-and-tests
# macOS Paper: rerun prep when changing renderer
yarn storybook prep --macos --paper
yarn storybook build --macos --paper
yarn storybook --verbose smoke --macos --paper --mode stories-and-tests
```

Win32 native application build is **unsupported**, not passed. macOS lanes require a Mac and remain required for the
full existing desktop support claim. Package/CLI fixtures that mutate generated state finish before native lifecycle,
not concurrently with it. Focused `storybook test --<platform> --test <listed-case>` needs an owned running app/driver.

Observe keyboard/pointer selection, expanded/selected properties, UIA ExpandCollapse/SelectionItem transport where
appropriate, Narrator/VoiceOver, real popup focus/return/dismissal, active-window changes and native scrolling.
Check long labels, scaling/high contrast, first/last rows/tabs beyond the viewport, both popouts, resize bounds and
all smoke markers. Verify global theme changes preserve editor/counter, selected story, pane state and bridge identity.
Keep Dropdown's documented Win32 Tab behavior. Screenshots supplement native element/state lookup, not replace it.

### Package and final repository acceptance

Run `format`, `lint`, `build` and whole `test` in C/R, and S if its fixtures/source change. Run the app's declared
format/lint scripts; it has no generic app build/test script. Add actual packed source/lib/declaration/CONTRACT checks.
Then run from the root:

```powershell
yarn build
yarn check-package-contents
yarn check-publishing
yarn check-agent-instructions
yarn lage test-links
yarn change:check
yarn clean-lage-cache
yarn lage buildci
```

Clear Lage cache once before final aggregate acceptance, not repeatedly during iteration. Inspect write-capable
publishing/constraint fixes. Record exact commands/results and native endpoint/renderer/capability evidence.
An unavailable lane is unverified/blocked; an input skip or all-skipped success is not a native pass.

## 10. Reciprocal review provenance and reconciled decisions

The requested Claude Opus 5.5 invocation failed before execution with an unsupported-model service response.
The owner explicitly approved **Hydrafusion Max** instead. Completed participants:

| Model / configuration requested                                      | Independent report              | Reciprocal critique                                                        |
| -------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------- |
| GPT-6 Astra (`gpt-6-astra`), maximum reasoning, long context         | `astra-storybook-plan.md`       | `astra-storybook-cross-review.md`, reviewing Hydrafusion's complete report |
| Hydrafusion Max (`hydrafusion-max`), maximum reasoning, long context | `hydrafusion-storybook-plan.md` | `hydrafusion-storybook-cross-review.md`, reviewing Astra's complete report |

These four complete reports are retained as private session artifacts, not added to the product package. Model
invocations requested the maximum available reasoning/context configuration; this document does not infer a numeric
context-window size. Both reviewers inspected actual source and revisited contested claims; neither ran implementation
validation. No successful Claude review is claimed.

| Material disagreement/correction                           | Reconciled decision                                                                                                               |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ThemeTester identity / host versus controls only           | Extract generic host as a new public ThemeTester plus separate controlled ThemePicker; retain runtime adapter                     |
| Explicit Flex default versus existing inheritance          | Preserve initial inheritance explicitly; contract the inherited state before code, never label custom ambient tokens default Flex |
| Appearance types / System / high contrast                  | Reuse design request types for explicit selection, preserve untouched axes and retain System/high contrast                        |
| Flex-dark token guarantee                                  | Explicit design prerequisite or owner-approved limitation; appearance metadata cannot stand in for visual acceptance              |
| Full versus toolbar-only Win32 migration                   | Include runtime-private agentic navigation in both Sidebar locations; retain third-party addon bodies/non-Win32 LiteUI            |
| Recent-history and scrolling baseline claims               | Remove unsupported recent-history requirement; label state-retention/row-reveal guarantees as introduced behavior                 |
| ScrollView versus unspecified virtualization               | Start with measured mounted-row ScrollView and explicit selection/focus lifecycle; keep addon header/body scrollers               |
| Expanded-state props versus UIA behavior                   | Add real Win32 branch action transport; do not assume Button gains tree/SelectionItem patterns                                    |
| Inaccessible resize strip versus native smoke              | Supply real resize actions while preserving native-observable markers or deliberately revising their contract                     |
| Mandatory contract schema versus local prose precedent     | Bounded presence/catalog guard only, separate from HOC/Flex provenance tooling                                                    |
| Standalone helper stories versus whole-shell qualification | App-local global-chrome fixture, narrow discovery and finally-based restoration of app-global state                               |

Remaining pre-code gates are the five reviewed contracts, exact inherited-selection API and the Flex visual-acceptance
decision. All runtime/native guarantees remain subject to the executable validation above.
