---
id: index
kind: index
owner_paths:
  - references/agents
---

# Agent references

Shared, tool-neutral knowledge for agents working in this repository. The root [AGENTS.md](../../AGENTS.md) and scoped
`AGENTS.md` files route here, and skills in [`.github/skills`](../../.github/skills) own task workflows. Read only the
documents a task needs; links are navigation, not instructions to load everything they reach.

## Taxonomy

| Area                                                                          | Contents                                                                    |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [`repository/`](repository)                                                   | Architecture, commands and validation, TypeScript, permissions, and release |
| [`design/`](design)                                                           | Tokens, theming, and color utilities                                        |
| [`components/`](components)                                                   | Classification, v0 and v1 recipes, and legacy test apps                     |
| [`components/agentic/`](components/agentic)                                   | Agentic component recipes                                                   |
| [`components/agentic/contract-sources/`](components/agentic/contract-sources) | Source adapters for agentic component contracts                             |
| [`focus/`](focus)                                                             | Desktop focus behavior across component generations                         |
| [`native/`](native)                                                           | Native components, modules, and platform guidance                           |
| [`evals/`](evals/README.md)                                                   | Portable evaluation case fixtures; not instructions                         |

## Document index

| ID                                                       | Document                                                                        | Read when                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `repository.architecture`                                | [Architecture](repository/architecture.md)                                      | Orienting in the monorepo or choosing where code belongs                        |
| `repository.development`                                 | [Commands and validation](repository/development.md)                            | Building, testing, linting, validating, or adding a package                     |
| `repository.typescript`                                  | [TypeScript](repository/typescript.md)                                          | Changing compiler settings, platform types, or the JSX runtime                  |
| `repository.permissions`                                 | [Agent permissions](repository/permissions.md)                                  | Using `gh api`, Pod, process, loopback, or capture operations; changing policy  |
| `repository.release`                                     | [Changesets and release](repository/release.md)                                 | Changing a published package or release tooling                                 |
| `design.tokens-and-theming`                              | [Tokens and theming](design/tokens-and-theming.md)                              | Mapping tokens, theme-dependent styles, or color utilities                      |
| `components.classification`                              | [Classification and routing](components/classification.md)                      | Starting any component task                                                     |
| `components.v0`                                          | [v0 maintenance](components/v0.md)                                              | Changing or reviewing `foundation-compose` components                           |
| `components.v1`                                          | [v1 maintenance](components/v1.md)                                              | Changing or reviewing `compose` or `compressible` components                    |
| `components.legacy-test-apps`                            | [FluentTester and E2E](components/legacy-test-apps.md)                          | Changing v0 or v1 test pages or E2E specs                                       |
| `components.agentic.types-and-slots`                     | [Types and slots](components/agentic/types-and-slots.md)                        | Agentic public props, slots, resolved state, native props, or exports           |
| `components.agentic.state-and-accessibility`             | [State and accessibility](components/agentic/state-and-accessibility.md)        | Agentic state hooks, defaults, interaction, or accessibility                    |
| `components.agentic.styles-and-tokens`                   | [Styles and tokens](components/agentic/styles-and-tokens.md)                    | Agentic styles, token mapping, theme caching, or state precedence               |
| `components.agentic.rendering`                           | [Rendering and assembly](components/agentic/rendering.md)                       | Agentic render functions, assembly, or display names                            |
| `components.agentic.tests-and-stories`                   | [Tests and stories](components/agentic/tests-and-stories.md)                    | Agentic tests, stories, `wdio` story tests, or validation                       |
| `components.agentic.contract-sources.flex-x3`            | [Flex and X3](components/agentic/contract-sources/flex-x3.md)                   | Contract evidence from the pinned Flex catalog                                  |
| `components.agentic.contract-sources.fluent-v9`          | [Fluent v9](components/agentic/contract-sources/fluent-v9.md)                   | Contract evidence from Fluent UI v9 source or specifications                    |
| `components.agentic.contract-sources.html-css`           | [HTML and CSS](components/agentic/contract-sources/html-css.md)                 | Contract evidence from HTML, CSS, or browser output                             |
| `components.agentic.contract-sources.visual-reference`   | [Visual reference](components/agentic/contract-sources/visual-reference.md)     | Contract evidence from images, screenshots, or renders                          |
| `components.agentic.contract-sources.local-foundation`   | [Local foundation](components/agentic/contract-sources/local-foundation.md)     | Foundational components without a Flex catalog entry                            |
| `components.agentic.contract-sources.composite-evidence` | [Composite evidence](components/agentic/contract-sources/composite-evidence.md) | Contracts combining more than one source set                                    |
| `focus.common`                                           | [Common focus authoring](focus/common.md)                                       | Any focusable component, collection, popup, focus hook, or native focus adapter |
| `focus.windows-win32`                                    | [Windows and Win32 focus](focus/windows-win32.md)                               | Focus work on React Native Windows or Win32                                     |
| `focus.macos`                                            | [macOS focus](focus/macos.md)                                                   | Focus work on macOS                                                             |
| `native.components-and-modules`                          | [Native components and modules](native/components-and-modules.md)               | Any native component, module, service, or native-backed wrapper                 |
| `native.apple-office`                                    | [Apple native authoring and Office integration](native/apple-office.md)         | Any iOS or macOS Swift, Objective-C, header, podspec, or bridge-manager change  |
| `native.windows-fabric`                                  | [Windows Fabric native components](native/windows-fabric.md)                    | React Native Windows Fabric views, codegen, registration, or UIA                |

## Placement and extension

- Put guidance here when more than one skill, reviewer, scoped `AGENTS.md`, or evaluation uses it, or when it is general
  repository knowledge. Keep guidance in a skill when only that workflow uses it.
- Keep product contracts (`SPEC.md`, `spec/`, `CONTRACT.md`), protocols, token maps, and package documentation with
  their packages, and link to them. Owner-local instruction trees, such as the desktop driver's `references/`, stay
  with their packages.
- Place a new document in the narrowest existing area. Create a new area only for a distinct domain, and add it to the
  taxonomy table. Add every new document to the document index with a concrete "Read when" condition.
- When moving a document, keep its `id`, update inbound links, and leave a `compatibility-reference` at the old path
  that links directly to the new location.

## Frontmatter standard

Every Markdown file in this directory, and every Markdown file under a skill's `references/` directory, starts with
exactly these keys in this order:

```yaml
---
id: components.v1
kind: instruction-reference
owner_paths:
  - packages/framework/framework
---
```

- `id`: lowercase, dot-separated segments of letters, digits, and hyphens. IDs are unique and permanent, including
  across moves.
- `kind`: `index` for directory indexes, `instruction-reference` for guidance agents follow, `evidence-reference` for
  version-bound observations, or `compatibility-reference` for a redirect left at a retired path.
- `owner_paths`: one or more existing repository paths whose maintainers own the technical content.

Do not add other keys. Load conditions belong in this index and in routers, not in frontmatter.

## Rule and claim IDs

- `R-<AREA>-<NNN>` identifies a consequential, testable obligation, such as `R-V1-003`. Define it once, in an
  instruction file, as a list item that begins with the bold ID and a colon. Elsewhere, cite the ID.
- `C-<AREA>-<NNN>` identifies a version-bound observation. Its definition states the source, inspected version or
  revision, and date.
- Assign IDs only where an implementation, review, or evaluation needs to cite the obligation. Never renumber or reuse
  an ID; retire it by removing its definition and every citation.
- These IDs cannot collide with component requirement IDs such as `BTN-006`, which belong to component contracts.

## Routing conventions

- State a prerequisite explicitly: "Read [common focus authoring](focus/common.md) first", a sentence such as "Focus
  work starts with" followed by the linked document, or a `Read first` section. Prerequisites must not form cycles, and
  a chain may be at most three reads deep.
- Compatibility references are terminal. Link to the replacement document, never to a compatibility path.
- Routing tables, meaning tables with a `Skill` or `Workflow` column, route each task to exactly one skill. A task
  routed in more than one table must route to the same skill everywhere. Overlays belong in the workflow, not the
  routing table.
- Route every project skill from the root `AGENTS.md` routing table.

## Validation

`yarn check-agent-instructions` validates frontmatter, links and fragments in instruction files, inbound fragments to
instruction files, skill metadata, rule definitions and citations, this index, the routing conventions above, and the
evaluation fixtures. It also runs in `yarn lage buildci`.
