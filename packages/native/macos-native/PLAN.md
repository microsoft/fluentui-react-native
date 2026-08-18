# Create a thin native wrapper for macOS native components

1. This should be a single package called @fluentui-react-native/macos-native
2. It should contain a set of native components for using macOS control directly in react-native.
3. Components should depend on framework-base and should be primitive components
4. Components should work in both paper and fabric
5. Components should have stories and should be shown in the storybook

## Component Inventory

Inventory the stock controls for macOS and for each control:

- Give the name, description, what it does
- List what customizations can be applied to the control
- List whether it has special appearance changes for things like liquid glass
- Give a brief summary of whether it would be useful to include with a decision field for implement now, implement later, don't implement.

Put the component inventory in an inventory.md file in this directory.

## Plan refinement

At the same time refine the overall plan but hold off on implementing it until decisions are made on the component inventory.

### Refined plan (pending inventory decisions)

**Package shape** (mirrors `packages/framework-base` / native component packages like `Callout`):

- `@fluentui-react-native/macos-native`, `type: module`, depends on `@fluentui-react-native/framework-base`
  (workspace:*) only — no theming/tokens/composition dependency, since these are primitives, not styled components.
- `src/index.ts` — explicit named exports only (no barrel `export *`), one export per component plus its prop types.
- One subfolder per native control under `src/<ControlName>/` (e.g. `src/Button/`), each with:
  - `<ControlName>NativeComponent.ts` — `codegenNativeComponent` spec (fabric) shared with paper via the existing
    RN interop, following the `RCT*ComponentView` pattern used in `packages/components/Callout/macos`.
  - `<ControlName>.tsx` — thin RN component (`@jsxImportSource @fluentui-react-native/framework-base`) that renders
    the native component, mapping/validating props but adding no Fluent styling.
  - `<ControlName>.types.ts` — public prop types.
  - `<ControlName>.stories.tsx` — storybook story per component (per PLAN.md item 5), pattern to match existing
    storybook entries under `packages/agentic-components/src/*/*.stories.tsx`.
- Native implementation lives in `macos/` (Swift + `RCT*ComponentView.mm`/`.h`), plus a `FRNMacosNative.podspec`
  at package root, following `packages/components/Callout` as the structural template.
- `apps/win32` is not applicable; add to FluentTester's macOS test app / Podfile per component as done for other
  native modules ("must be added to FluentTester's Podfile — transitive dependencies aren't autolinked").

**Paper + Fabric compatibility**: use `codegenNativeComponent` for all view-based controls so both architectures
share one native component definition, consistent with existing FRN native components (see `packages/components/
RadioGroup`, `FocusZone`, `MenuButton`, `Callout`).

**Sequencing** (do not start until inventory decisions are confirmed):

1. Land package scaffolding (package.json, tsconfig, podspec, empty `src/index.ts`) and register the package's
   `tsconfig.json` in the root `tsconfig.json` references, per the "Creating a New Component" steps in AGENTS.md.
2. Implement first-wave ("Now") components one at a time, smallest/lowest-risk first: NSSwitch, NSStepper,
   NSColorWell, NSSlider, NSProgressIndicator, NSButton, NSSegmentedControl, NSPopUpButton — each with its own
   native view + thin RN wrapper + story + a `SPEC.md` documenting the mapped native API surface and any platform
   caveats.
3. Implement NSVisualEffectView, then attempt NSGlassEffectView/NSGlassEffectContainerView last, since it requires
   confirming/guarding a macOS 26+ minimum-OS gate (fall back gracefully, e.g. render a plain container, on older
   OS versions) — treat this as a stretch/spike within the first wave rather than a blocking dependency for the
   rest.
4. Add each component's test page to FluentTester (`apps/fluent-tester/src/TestComponents/`) for manual
   verification, matching the existing component onboarding steps in AGENTS.md.
5. Defer "Later" components (NSDatePicker, NSTableView/NSOutlineView, NSComboBox, NSCollectionView, NSToolbar,
   NSSplitView) to a follow-up design pass once first-wave patterns (native module registration, prop bridging,
   story authoring) are proven; do not scaffold them until that design pass happens.
6. Skip "Don't implement" items entirely (NSTextField/NSSecureTextField, NSImageView, NSScrollView, NSStackView,
   NSTabView) since existing RN/react-native-macos primitives already cover them.

**Open decisions before implementation starts** (see `inventory.md` Decision Summary table):

- Confirm the first-wave component list and ordering above.
- Confirm minimum supported macOS/react-native-macos version, since it gates NSGlassEffectView availability and
  whether older-OS fallback behavior is required.
- Confirm whether E2E test coverage (per AGENTS.md's E2E Testing section) is required for this package's first wave,
  given these are primitives rather than full higher-order components.
