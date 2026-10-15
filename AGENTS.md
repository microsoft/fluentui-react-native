# AGENTS.md

Guidance for coding agents working in the FluentUI React Native monorepo, which implements Microsoft's Fluent Design
System for iOS, Android, macOS, Windows, and Win32. This file is always loaded. It holds repository safeguards and
routes each task to the workflow and references it needs; load only what the task requires.

## How guidance is organized

- **`AGENTS.md` files** hold safeguards and local invariants. Copilot CLI loads this file plus the `AGENTS.md` in the
  working directory and each ancestor. From the repository root, read the scoped files below when a task touches them.
- **Skills** in [`.github/skills`](.github/skills) define task workflows.
- **[Shared references](references/agents/README.md)** in `references/agents/` hold reusable recipes and repository
  knowledge, indexed by task.
- **Product contracts** (`SPEC.md`, `spec/`, `CONTRACT.md`), protocols, and package documentation stay with their
  packages and govern component behavior.

## Safeguards

These apply to every task.

- **Permissions:** [the repository hook](.github/hooks/agent-permissions.json) approves specific operations; it is not a
  sandbox, and other operations use normal permission handling (R-PERM-001). Do not amend commits, discard other
  people's changes, or rewrite history without explicit authorization (R-PERM-002). Never print authentication tokens
  or commit personal permission files, account names, or credentials (R-PERM-003). Unrestricted screen capture,
  `osascript`, debugger attachment, crash-report access, certificate-trust changes, and TCC resets need separate
  authorization (R-PERM-007). Read the [permissions reference](references/agents/repository/permissions.md) before
  using `gh api`, Pod, process, loopback `curl`, or capture operations, or changing the policy.
- **Validation:** run the owning workspace's declared scripts (R-VALID-001). Report each check as passed, failed,
  skipped, not run, or unsupported; JavaScript tests and bundles are not native qualification (R-VALID-002). Finish
  code or configuration changes with `yarn clean-lage-cache` and then `yarn lage buildci` (R-VALID-003).
- **Code:** no barrel exports (R-REPO-001); keep React Native fork imports in platform files (R-REPO-002); add a
  changeset for published packages (R-REPO-003); never copy private source bodies into this public repository
  (R-REPO-004).
- **Component generations:** v0 and v1 are maintenance-only; new components use the agentic workflow (R-V0-001,
  R-V1-001). Classify code by imports and structure, not by path (R-CLASSIFY-001).
- **Native boundary:** before changing Swift, Objective-C, C++, headers, podspecs, Windows projects, codegen specs,
  native registration, or a native-backed platform wrapper, use the
  [native component skill](.github/skills/implement-native-component/SKILL.md), directly or as an overlay. iOS and
  macOS changes must keep both CocoaPods-module and Office bridging-header builds working; follow the
  [Apple and Office rules](references/agents/native/apple-office.md).

## Route the task

Classify the change with the [classification guide](references/agents/components/classification.md), then use:

| Task                                                                                | Skill                                                                                                |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| New component, or change or plan a change to an agentic component or primitive      | [agentic-component-authoring](.github/skills/agentic-component-authoring/SKILL.md)                   |
| Agentic contract-only or contract-feasibility work                                  | [agentic-component-contract-authoring](.github/skills/agentic-component-contract-authoring/SKILL.md) |
| Fix or maintain an existing v0 or v1 component                                      | [maintain-v0-v1-component](.github/skills/maintain-v0-v1-component/SKILL.md)                         |
| Review a component change of any generation                                         | [review-component](.github/skills/review-component/SKILL.md)                                         |
| Native component, TurboModule, service, codegen, or a native-core `/legacy` wrapper | [implement-native-component](.github/skills/implement-native-component/SKILL.md)                     |
| Cross-component agentic extraction or dependency direction                          | [agentic-component-optimization](.github/skills/agentic-component-optimization/SKILL.md)             |
| Storybook app, Metro, CocoaPods, or desktop native toolchain                        | [agentic-storybook-development](.github/skills/agentic-storybook-development/SKILL.md)               |
| Dependency vulnerability remediation                                                | [fix-security-issues](.github/skills/fix-security-issues/SKILL.md)                                   |

Other repository work starts from the [reference index](references/agents/README.md): architecture, commands and
validation, TypeScript, release, design tokens, focus, and native guidance.

## Scoped instructions

| Path                                                                                             | Scope                                                  |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| [packages/agentic/components](packages/agentic/components/AGENTS.md)                             | Agentic package invariants, contracts, and story tests |
| [packages/agentic/components/src](packages/agentic/components/src/AGENTS.md)                     | Source boundaries and extraction                       |
| [.../src/components](packages/agentic/components/src/components/AGENTS.md)                       | Higher-order components and the focus visual policy    |
| [.../src/primitives](packages/agentic/components/src/primitives/AGENTS.md)                       | Public primitives                                      |
| [packages/agentic/desktop-driver](packages/agentic/desktop-driver/AGENTS.md)                     | Desktop WebDriver driver                               |
| [packages/framework-base](packages/framework-base/AGENTS.md)                                     | Shared component patterns                              |
| [packages/framework-base/src/accessibility](packages/framework-base/src/accessibility/AGENTS.md) | Accessibility helpers and native action qualification  |
| [packages/framework/framework](packages/framework/framework/AGENTS.md)                           | v1 framework package                                   |
| [packages/deprecated/foundation-compose](packages/deprecated/foundation-compose/AGENTS.md)       | v0 framework package                                   |
| [apps/storybook](apps/storybook/AGENTS.md)                                                       | Storybook app, native workflows, and diagnostics       |

## Quick facts

- Yarn 4 in pnpm mode; TypeScript 7.0.2 compiled as one `tsc -b` project-references graph; Lage task orchestration.
  New packages must be added to the root `tsconfig.json` `references`.
- `yarn build` builds the repository; `yarn lage test` and `yarn lage lint` test and lint packages; `yarn format` formats.
  `yarn lage buildci` runs the CI aggregate, including `yarn check-agent-instructions`. `yarn clean-lage-cache` clears
  the Lage cache before final validation.
- Details: [commands and validation](references/agents/repository/development.md),
  [architecture](references/agents/repository/architecture.md), [TypeScript](references/agents/repository/typescript.md),
  and [release](references/agents/repository/release.md).
