# @fluentui-react-native/agentic-authoring

> Status: **Plan** (package not yet created). Part of the `packages/agentic/` modernization — see [`../STAGING.md`](../STAGING.md).
>
> ✅ **Sources received & incorporated.** The "modern authoring concepts" come from **`Fluent Headless and Fluent Modern.docx`** (repo root) and the skill format/structure from the **x3-design token skills** (`~/dev/fluent-design/plugins/tokens/skills/{core,interaction,textstyle}/SKILL.md`), alongside the public **microsoft/fluentui `AGENTS.md` + skills** pattern.

## Purpose

A distributable bundle of agent **skills**, **instructions**, and an optional **MCP server** that lets a coding agent (Claude Code, Copilot, Cursor, …) author new fluent-themed React Native components in the new **Fluent Headless → Fluent Modern** style — consuming `agentic-concepts`, `agentic-tokens`, `agentic-analyzer`, and `agentic-components`. It is the "router + verb-decomposed skills" layer modeled on how microsoft/fluentui (web) and the x3-design token plugin structure their agent guidance.

**What it authors:** the three-forms headless component (`X` + `useX` + `renderX`) plus the Modern styling layer (`useXStyles` consuming `agentic-tokens` generics) — behavior/ARIA separated from the swappable styled layer, per the Fluent Headless thesis in the docx.

## Identity

- **npm:** `@fluentui-react-native/agentic-authoring`
- **path:** `packages/agentic/agentic-authoring/`
- Ships `skills/` + an `AGENTS.md` router + an optional `mcp/` server (`bin`). Add to root `tsconfig.json` `references`.

## Findings that shape it

- **microsoft/fluentui (web) pattern (verified):** a terse **router `AGENTS.md`** (critical rules → one golden template → anti-patterns → link tables → a Skills table → package layout) plus **verb-decomposed skills** canonical at `.agents/skills/<name>/SKILL.md`, **mirrored** at `.claude/skills/<name>/SKILL.md` as a one-line transclusion (`@../../../.agents/skills/<name>/SKILL.md`). `SKILL.md` = YAML frontmatter (`name`, `description`, `disable-model-invocation?`, `argument-hint`, `allowed-tools`) + imperative `## Steps` (numbered, fenced commands) + local `## Rules`/`## Anti-patterns`. Bulky knowledge offloaded to a `references/` subdir ("fat skill").
- **Fluent Headless / Fluent Modern doc (received):** defines the strategy the authoring agent implements — ship behavior as stable unstyled primitives in **three forms** (`X` / `useX` / `renderX`), keep the styled (Modern/token) layer a swappable concern on top. The agent's output must follow this split.
- **x3-design token skills (received):** the `SKILL.md` format to mirror — YAML frontmatter (`name`, `description`, `argument-hint`) + a `| Field | Value |` table (Type/Category/Related) + a "Files in this skill" table + reference `*.yaml`. The token plugin's three skills (`core` primitives/generics, `interaction` hover/pressed derivation, `textstyle` bundles) are the canonical vocabulary the `token-lookup` skill resolves against.
- **This repo:** has a root `AGENTS.md` + `CLAUDE.md`; `apps/component-generator` is a **Gulp string-replacement scaffolder** emitting the **old compose/tokens** shape — i.e. it generates the *legacy anti-pattern*; the authoring skill must target the new flat three-forms `agentic-components` shape, not wrap the legacy generator. No `SKILL.md`/`.agents/` exist yet.

## Proposed structure (PROVISIONAL — pending sources)

```
agentic-authoring/
  package.json                     # name, files[], bin (mcp), exports
  AGENTS.md                        # package-scoped router (component-authoring focused)
  skills/                          # CANONICAL skills (shipped in the package)
    new-component/SKILL.md         # scaffold a new-style fluent RN component (the flat shape)
    new-component/references/      # file-layout.md, platform-matrix.md, golden-template.md
    token-lookup/SKILL.md          # resolve semantic slot -> agentic-tokens value
    pin-tests/SKILL.md             # author analyzer-based pinning/snapshot tests
    register-tester/SKILL.md       # add FluentTester page + testPages.<platform>
    e2e-scaffold/SKILL.md          # PageObject + Spec + consts
    changeset/SKILL.md  lint-package/SKILL.md
  instructions/  concepts.md  authoring-rules.md   # critical rules; compose/customize = anti-pattern
  mcp/  server.ts                  # optional: list_tokens, resolve_token, scaffold_component,
                                   #           list_v1_components, get_component_spec, run_pin_tests
```

Plus repo-root discovery stubs (one-line transclusions — no duplication, exactly fluentui's pattern):

```
.agents/skills/<name>/SKILL.md  ->  @../../../packages/agentic/agentic-authoring/skills/<name>/SKILL.md
.claude/skills/<name>/SKILL.md  ->  @../../../packages/agentic/agentic-authoring/skills/<name>/SKILL.md
```

**MCP server: optional, later.** Skills alone (markdown + the agent's native file/bash tools) cover most authoring. Add the MCP server once `agentic-tokens`/`agentic-analyzer` exist, where deterministic repo-aware ops beat free-form tool use (`resolve_token`, `scaffold_component`, `get_component_spec`, `run_pin_tests`). Skills should *prefer* MCP tools when present, falling back to Bash/Read.

## How the agent authors a component (`/new-component Badge`)

1. **Load concepts** — read `agentic-concepts` (states/appearance/interactions/a11y/token refs) + the matching v1 spec.
2. **Map tokens** — translate v1 theme/token refs to `agentic-tokens` semantic slots (`token-lookup` / MCP `resolve_token`).
3. **Scaffold (Headless three-forms + Modern styling)** — emit the `agentic-components` file set: `useX` (behavior/ARIA) → `renderX` → `useXStyles` (tokens) → `X`, **no compose/customize, no inter-component deps**; declare `interaction.applies-to` in the token map; use `references/golden-template.md` (kept in sync with `agentic-components`).
4. **Register** — `register-tester` adds the FluentTester page + `testPages.<platform>`; add the new tsconfig to root `references`.
5. **Pin & test** — `pin-tests` uses `agentic-analyzer` (sentinel theme + RNTL) to snapshot resolved styles/tokens, a11y tree, multiplexed per platform.
6. **e2e-scaffold;** then `yarn change`, `yarn lint`, `yarn build`.

## Dependencies & intersections

- **agentic-concepts** — knowledge source (skills payload + v1→new mapping); `get_component_spec`/`list_v1_components` read it. Hard dep.
- **agentic-tokens** — target vocabulary; `token-lookup`/`resolve_token` resolve slots. Hard dep.
- **agentic-analyzer** — verification engine behind `pin-tests`/`run_pin_tests`.
- **agentic-components** — output target; `golden-template.md` mirrors its conventions (single source of truth for the shape).
- Supersedes `apps/component-generator` for new-style output (mark the Gulp/compose template a legacy anti-pattern so the agent doesn't regenerate the old style).

## Open questions

- **Sequencing:** thin without the other four — build with stubs/contracts early, fill as they land (it's the *last* useful workstream).
- **MCP vs skills duplication:** keep logic in one place (MCP server or shared lib); skills call it to avoid drift.
- **"Distributable" target:** shipping `skills/` + `AGENTS.md` in npm is easy; discoverability in a *consumer* repo needs an install step — `npx … init` or `postinstall` to copy/transclude into the consumer's `.claude`/`.agents`.
- **Multi-runtime:** Claude (`.claude/skills`) covered by transclusion; Copilot (`.github/instructions`) / Cursor (`.cursor/rules`) need generated adapters if in scope.

## Phased plan

0. **Contracts (parallel):** `package.json`, the `SKILL.md` contract, a stub `AGENTS.md` router, `authoring-rules.md` (compose/customize = anti-pattern), `golden-template.md` from the agreed `agentic-components` shape. No runtime deps.
1. **Skills (after concepts + components):** `new-component`, `register-tester`, `changeset`, `lint-package` as markdown skills using native Read/Write/Bash; add root `.agents/`+`.claude/` transclusion stubs.
2. **Token + test skills (after tokens + analyzer):** `token-lookup`, `pin-tests`, `e2e-scaffold`.
3. **Optional MCP server** sharing logic with the skills; add `bin`.
4. **Distribution:** `init`/`postinstall`, optional Copilot/Cursor adapters, README; root `references` + changeset.
