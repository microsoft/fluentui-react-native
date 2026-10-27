---
id: components.test-components
kind: instruction-reference
owner_paths:
  - packages/agentic/components
  - apps/storybook
---

# Test and story components

The `@fluentui-react-native/components/test` entry point contains small
runtime-safe React Native composites reused by Storybook stories and
story-driven tests. They are public test/demo UI, not unstyled primitives,
component contracts, native modules, test runners or a place for Node-only
helpers.

| Component     | Contract                                                           |
| ------------- | ------------------------------------------------------------------ |
| `ThemeTester` | [`theme-tester/CONTRACT.md`](../src/test/theme-tester/CONTRACT.md) |
| `ThemePicker` | [`theme-picker/CONTRACT.md`](../src/test/theme-picker/CONTRACT.md) |
| `StoryGroup`  | [`story-group/CONTRACT.md`](../src/test/story-group/CONTRACT.md)   |
| `StoryItem`   | [`story-item/CONTRACT.md`](../src/test/story-item/CONTRACT.md)     |
| `StoryStatus` | [`story-status/CONTRACT.md`](../src/test/story-status/CONTRACT.md) |

These components are exported only from `@fluentui-react-native/components/test`.
Keep implementations free of Storybook, WDIO, Jest, RNTL and Node dependencies.
Keep package-private component implementations on leaf imports; never make the
components package depend on the Storybook runtime or app.

Each component's colocated `CONTRACT.md` is its local React Native behavior
contract. It is not a Flex `SPEC.md`, does not require Flex source provenance,
and is not covered by the HOC source-drift report. Review changes against the
contract, public types, focused runtime/type tests, stories and applicable
native evidence.

Stories use these components to share stable anatomy only. Keep sample sizing,
focus/modality probes, measurement, component-specific state and scenario
logic with their owning stories. Keep the two distinct structures in
CompoundItemLayout and LayoutStableText stories local.

`StoryStatus` owns an accessible named View and decorative text. Keep its ID
and visible/accessibility values aligned so desktop-native automation observes
the same status.

`ThemePicker` composes the existing Dropdown/ListboxItem behavior. Do not add a
parallel popup or duplicate Dropdown's focus, keyboard or dismissal logic.
`ThemeTester` owns its theme boundary; app adapters provide app-specific IDs
and configuration without wrapping it in a second runtime root.

The spec-contract tool validates higher-order component `SPEC.md` provenance.
It does not validate these prose contracts. The test-component presence guard
checks the explicit exported catalog and contract files only; it does not
approve contract content or native qualification.
