---
id: components.classification
kind: instruction-reference
owner_paths:
  - packages/components
  - packages/agentic/components
  - packages/framework
  - packages/deprecated/foundation-compose
---

# Component classification and routing

Classify every changed surface before choosing a workflow or recipe. A single package, or a single diff, can contain
more than one generation; Button ships both v0 and v1 implementations.

- **R-CLASSIFY-001:** Classify an implementation by its imports and component structure together. Paths such as
  `deprecated/` or `legacy/`, export suffixes, the JSX pragma, and individual helpers such as `directComponent` or
  `stagedComponent` are hints, not proof.
- **R-CLASSIFY-002:** Record the task mode, implementation model, public compatibility surface, and native obligations
  separately for each changed surface. Load each applicable recipe for a mixed change; never force the whole change
  into one generation.

## 1. Task mode

| Task                                                                                            | Workflow                                                                                                      |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Create a new component                                                                          | [agentic-component-authoring](../../../.github/skills/agentic-component-authoring/SKILL.md)                   |
| Change, or plan a change to, an existing agentic component or primitive                         | [agentic-component-authoring](../../../.github/skills/agentic-component-authoring/SKILL.md)                   |
| Agentic contract-only or contract-feasibility work                                              | [agentic-component-contract-authoring](../../../.github/skills/agentic-component-contract-authoring/SKILL.md) |
| Fix or maintain an existing v0 or v1 component                                                  | [maintain-v0-v1-component](../../../.github/skills/maintain-v0-v1-component/SKILL.md)                         |
| Review a component change of any generation                                                     | [review-component](../../../.github/skills/review-component/SKILL.md)                                         |
| Native component, TurboModule, native service, codegen, or native-core `/legacy` wrapper change | [implement-native-component](../../../.github/skills/implement-native-component/SKILL.md)                     |
| Cross-component agentic extraction or dependency direction                                      | [agentic-component-optimization](../../../.github/skills/agentic-component-optimization/SKILL.md)             |
| Desktop test configuration, execution, reporting, helpers, or CI                                | [desktop-testing](../../../.github/skills/desktop-testing/SKILL.md)                                           |
| Change or review the desktop testing package source                                             | [maintain-desktop-testing](../../../.github/skills/maintain-desktop-testing/SKILL.md)                         |
| Storybook app catalog, Metro, CocoaPods, or native builds                                       | [agentic-storybook-development](../../../.github/skills/agentic-storybook-development/SKILL.md)               |
| Dependency vulnerability remediation                                                            | [fix-security-issues](../../../.github/skills/fix-security-issues/SKILL.md)                                   |

v0 and v1 are maintenance-only (R-V0-001, R-V1-001). A request for a new component uses the agentic workflow even
when a v0 or v1 component with a similar name exists.

## 2. Implementation model

| Model                  | Decisive evidence                                                                                                                                                                                                         | Representative source                                                                   | Recipe                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| v0                     | Imports from `@uifabricshared/foundation-compose` (or `foundation-settings`/`foundation-tokens`); `IComposeSettings`, `usePrepareProps`, `mergeSettings`, `_overrides`, `_precedence`                                     | [deprecated Button](../../../packages/components/Button/src/deprecated/Button.tsx)      | [v0](v0.md)                                                                             |
| v1 compose             | `compose` from `@fluentui-react-native/framework` with a `{ props, tokens, slotProps }` descriptor and `useRender`                                                                                                        | [Button](../../../packages/components/Button/src/Button.tsx)                            | [v1](v1.md)                                                                             |
| v1 compressible        | `compressible` from `@fluentui-react-native/framework`; it may return a framework-base `directComponent` continuation                                                                                                     | [Text](../../../packages/components/Text/src/Text.tsx)                                  | [v1](v1.md)                                                                             |
| Agentic higher-order   | Under `packages/agentic/components/src/components`; `<component>.types.ts`, `use<Component>.ts`, `use<Component>Styles.ts`, `render<Component>.tsx`, and `<component>.ts`; `_unstable` stage exports; React 19 `ref` prop | [agentic Button](../../../packages/agentic/components/src/components/button/button.ts)  | [agentic skill](../../../.github/skills/agentic-component-authoring/SKILL.md)           |
| Agentic primitive      | Under `packages/agentic/components/src/primitives`; colocated `CONTRACT.md`; unstyled; often a hook-free `directComponent`                                                                                                | [Icon](../../../packages/agentic/components/src/primitives/icon/icon.tsx)               | [primitive instructions](../../../packages/agentic/components/references/primitives.md) |
| Framework-base pattern | `phasedComponent`, modern `directComponent`, `useSlot`/`useOptionalSlot`, and `Slot<typeof View>` outside the agentic package                                                                                             | [component patterns](../../../packages/framework-base/references/component-patterns.md) | [framework-base instructions](../../../packages/framework-base/AGENTS.md)               |
| No component model     | Native modules, services, utilities, or tooling                                                                                                                                                                           | [native-core](../../../packages/agentic/native-core/AGENTS.md)                          | Owning package documentation                                                            |

Framework-base utilities such as `mergeProps`, `useSlot`, `directComponent`, and the JSX runtime appear inside v1 and
v0 implementations for compatibility. Their presence does not change the component's generation. Both v0 and v1 use
the `@jsxImportSource @fluentui-react-native/framework-base` pragma.

## 3. Public compatibility surface

Record the API obligations independently of the implementation model:

- Legacy unsuffixed exports beside `V1` exports, such as `Button` and `ButtonV1`.
- v0 and v1 `componentRef` APIs, versus the agentic React 19 `ref` prop.
- The agentic package root versus its `@fluentui-react-native/components/primitives` entrypoint.
- Native-core's `/legacy` entrypoint. Its [Callout](../../../packages/agentic/native-core/src/legacy/callout/Callout.tsx)
  is a modern implementation that preserves a legacy public API and `componentRef`.
- Native registration names, which must not change during maintenance.

## 4. Native obligations

Treat the change as native work, and add the
[implement-native-component](../../../.github/skills/implement-native-component/SKILL.md) checklist as an overlay,
when it touches any of:

- Swift, Objective-C, Objective-C++, C++, IDL, headers, podspecs, or Windows project files;
- `codegenNativeComponent` or TurboModule specifications, native registration, or native event/command shapes;
- a platform wrapper whose root is a native component, such as
  [the macOS experimental Checkbox](../../../packages/experimental/Checkbox/src/Checkbox.macos.tsx);
- accessibility actions, focus targets, or refs that cross a native boundary.

File suffixes are not the only trigger: a TypeScript-only change to a native prop, ref, or event contract is native
work.
