# Agent instruction improvements: remaining decisions

**Status:** The plan is implemented on `user/jasonvmo/instruction-rework`. The efficacy skill (former P5) moved to the
owner's external workflow. Completed work has been removed from this file; what remains are decisions that need owner
input and follow-ups outside this branch. Delete this file before submitting the PR.

## Decisions needing your input

Edit **Answer** and **Status** for each item.

### R01: Version-bound evidence in focus and accessibility guidance

**Status:** Open
**Answer:**

The `C-<AREA>-<NNN>` claim IDs and the `evidence-reference` document kind are defined and validated, but nothing uses
them yet. Pinned platform observations are still mixed with rules in
[`references/agents/focus/`](references/agents/focus/common.md) and the
[framework-base accessibility instructions](packages/framework-base/src/accessibility/AGENTS.md). Examples include
React Native Windows 0.81.35 dispatch, react-native-win32 0.81.8 declarations, and React Native macOS 0.81.9 Fabric
custom actions. Component `spec/accessibility.md` files cite the accessibility file.

| Option                                                                                   | Effect                                                                                   |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1. Leave as is (recommended for this PR)                                                 | No churn now; revisit when a pinned version changes.                                     |
| 2. Tag key pinned claims as `C-FOCUS-*` / `C-A11Y-*` definitions in place                | Evals and reviews can cite exact observations; needs your accuracy review of each claim. |
| 3. Move observations into `evidence-reference` documents and link to them from the rules | Cleanest separation; the most churn, including links cited by component specs.           |

### R02: Skill size

**Status:** Open
**Answer:**

The advisory body budget is about 600 words. Over budget: `fix-security-issues` at 1,042 words (unchanged by this
work), `agentic-component-contract-authoring` at 685, and `agentic-component-authoring` at 613. Every description is
within the 60-word limit the checker enforces.

| Option                                | Effect                                                                                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Accept current sizes (recommended) | Only `fix-security-issues` is substantially over, and it loads only for dependency advisories.                                           |
| 2. Split `fix-security-issues`        | Move the `ignore:` plugin and dedupe procedures into a `references/agents/repository/dependency-security.md` reference loaded on demand. |
| 3. Enforce the budget in the checker  | Hard failures on body length; risks pushing coherent rules apart.                                                                        |

### R03: Retiring compatibility redirects

**Status:** Open
**Answer:**

Sixteen `compatibility-reference` stubs remain under `.github/skills/*/references/` so old links resolve. Every
repository link now targets the new locations, and the checker blocks new links to stubs. External links, such as your
workflow repository's activity records, may still use the old paths.

| Option                                                   | Effect                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| 1. Keep for one release cycle, then remove (recommended) | Gives external links time to move; name the release or date. |
| 2. Keep indefinitely                                     | Small permanent clutter in skill directories.                |
| 3. Remove in this PR                                     | Cleanest tree; breaks external links immediately.            |

### R04: Stale contributor documentation

**Status:** Open
**Answer:**

Human-facing docs still use pre-reorganization paths:
[CONTRIBUTING.md](CONTRIBUTING.md) lines 72-73 reference `apps/fluent-tester/src/TestComponents`, `testPages.tsx`,
and `testPages.<platform>.tsx`, and [apps/E2E/README.md](apps/E2E/README.md) line 146 references the same tester path.
The current locations are `apps/tester-core/src/TestComponents` and a single `apps/tester-core/src/testPages.ts`.

| Option                          | Effect                                   |
| ------------------------------- | ---------------------------------------- |
| 1. Fix in this PR (recommended) | Small, verified path corrections.        |
| 2. Fix in a separate PR         | Keeps this PR scoped to agent guidance.  |
| 3. Leave                        | Contributors keep following stale paths. |

### R05: Optional refinements from the GPT-6.1 Sol holdouts

**Status:** Open
**Answer:**

The candidate passed every holdout assertion, but two inefficiencies surfaced. Acting on either uses up the affected
holdout: relabel it as development and add a new holdout.

1. The legacy native-core Callout plan first loaded `maintain-v0-v1-component`, then corrected itself to
   `implement-native-component`. A clarification in that skill would say that a legacy public entrypoint is not
   evidence of v0 or v1, and that native-core legacy wrappers route to native work.
2. The iOS helper plan read desktop Storybook and native-core documents before concluding they did not apply. All three
   native holdouts cost more AI usage with the candidate. A refinement in `implement-native-component` would read
   native-core documents only for native-core work and send iOS-only validation to the owning iOS host.

| Option                                                   | Effect                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1. Apply both and replace the two holdouts (recommended) | Removes a misroute and likely trims native-case cost; needs two new holdouts. |
| 2. Apply only the routing clarification                  | Smallest change; leaves native-case cost as is.                               |
| 3. Leave as is and monitor in the external workflow      | Holdouts stay unseen; inefficiencies remain.                                  |

### R06: Evidence sufficiency

**Status:** Open
**Answer:**

Two configurations have now run once per case. The candidate improved routing and assertion coverage in both. Token
savings were consistent, but AI-usage savings were small with GPT-6.1 Sol and negative for its native holdouts. There
were no repeated trials, so the percentages are not statistically reliable.

| Option                                                                            | Effect                                                                              |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1. Accept for this PR; run repeated trials in the external workflow (recommended) | Ships the routing and coverage gains now; the cost picture gets more precise later. |
| 2. Run three or more trials per case before the PR                                | Stronger evidence; costs about 50 more probe sessions per model.                    |
| 3. Add another client, such as Claude Code                                        | Covers clients beyond Copilot CLI, the main client under D05.                       |

## Follow-ups outside this branch

- **`native-lib2`:** after this PR merges and that branch rebases without commit `246d33668`, add a route from
  `packages/agentic/native-core/AGENTS.md` to
  [`references/agents/native/apple-office.md`](references/agents/native/apple-office.md). The checker will validate the
  link.
- **External efficacy workflow:** reuse the committed [evaluation fixtures](references/agents/evals/README.md) and the
  local result-record shape. Keep holdouts out of instruction tuning.
- **Publish:** push the branch and open the PR. The evidence below can go in the description.

## Evidence for the PR description

- **Root instructions:** root `AGENTS.md` went from 27.4 KB to 7.9 KB. Copilot CLI loads it twice from the repository
  root, because `CLAUDE.md` imports it.
- **Safety extraction:** permissions moved with all 39 sentences preserved, and Apple/Office rules with all 28
  preserved, each confirmed by sentence-level comparison.
- **Checker:** `yarn check-agent-instructions` (15 tests) also enforces acyclic, at most three-deep prerequisites,
  terminal compatibility redirects, one skill per routing row with consistent routing across routers, and root routing
  for every skill.
- **Final validation:** a new root `yarn clean-lage-cache` script (`lage cache --clear`) followed by
  `yarn lage buildci` ran and passed all 171 tasks with none skipped. `yarn change:check` and
  `yarn lage test-links` also passed.

Pilot results, one run per case, read-only Copilot CLI 1.0.98 probes, baseline `a1fd5c65d`:

| Configuration                                                              | Expected skill reached                                                                              | Assertions met                                                                    | Input tokens | AI usage |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------ | -------- |
| Claude Sonnet 5.5, medium; 10 cases; self-scored                           | Baseline 4/10, candidate 10/10                                                                      | Baseline 17/22, candidate 22/22                                                   | −32%         | −22%     |
| GPT-6.1 Sol, high, long context; 8 development cases; independently scored | Baseline 1/1 available (9 skills absent); candidate 9/10, then 10/10 after the fix                  | Baseline 16 + 4 partial of 20, candidate 19 + 1 partial, then 20/20 after the fix | −24%         | −9%      |
| GPT-6.1 Sol, high, long context; 5 holdouts; independently scored          | Every available expected skill in both (3 of 5 baseline cases had no matching skill); candidate 5/5 | Baseline 10 + 1 partial + 1 failed of 12, candidate 12/12                         | −17%         | −2%      |

GPT-6.1 Sol found one development routing defect: agentic plan-only requests went to contract authoring and skipped
the authoring recipes. Commit `5e183ce7f` fixed it. On recheck, the case reached the authoring skill, read all five
required files, and passed both assertions, at 22% more input tokens than its pre-fix run.
