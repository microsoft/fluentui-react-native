# Agent instruction improvements: remaining decisions

**Status:** All previous decisions (D01-D12 and R01-R07) are implemented on `user/jasonvmo/instruction-rework`. This
file now lists only new decisions and follow-ups. Delete it before submitting the PR.

## Decisions needing your input

Edit **Answer** and **Status** for each item.

### R08: Where the efficiency skill should live

**Status:** Open
**Answer:**

An independent assessment compared an in-repository skill with keeping it in your external workflow. Key tradeoffs:

| Dimension      | In-repository skill                                                                                                                                     | External workflow                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Reach          | Every contributor sees it, but few would run it; the fixtures are already public.                                                                       | Owner only; others can still use the committed fixtures.        |
| Always-on cost | Every Copilot CLI session pays an estimated 100-200 more tokens for another skill description and root routing row; `CLAUDE.md` doubles the root share. | None in this repository.                                        |
| Misrouting     | An "efficiency" or "optimize" description could compete with `agentic-component-optimization`.                                                          | None.                                                           |
| Privacy        | Results written in the repository could be committed by accident; no repository-level results directory is ignored.                                     | Already separates raw logs from curated summaries.              |
| Telemetry      | Cannot use private session logs, so it covers only the fixture half.                                                                                    | Has the cross-session telemetry the loop needs.                 |
| Portability    | A committed harness would tie public maintenance to one client version's usage-event format.                                                            | Owner absorbs client drift privately.                           |
| Governance     | `@microsoft/furn-team` would own code that drives LLM sessions.                                                                                         | Instruction changes still land through reviewed PRs either way. |
| Repository fit | Strong: rule IDs, fixtures, and the checker are here.                                                                                                   | Cites rule IDs by reference; CI still validates the fixtures.   |
| Permissions    | Nested `copilot -p` and worktree commands fall outside the permission hook, so contributors would face prompts or broad grants.                         | Runs under your own approvals.                                  |
| Reuse          | This repository only.                                                                                                                                   | Works across repositories.                                      |

The assessment flagged a holdout-contamination risk: probe agents can read public fixtures. Checking the recorded runs
found that no probe in either pilot read or searched `references/agents/evals/`.

| Option                                                                                                                                                                                                         | Effect                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1. Keep the skill external, and add a short "Running an evaluation" procedure to `references/agents/evals/README.md` plus a checker guard rejecting stray files under `references/agents/evals/` (recommended) | Others can reproduce PR claims and result files cannot be committed by accident; no skill, runner, or routing cost. |
| 2. Keep everything external, with only the fixtures committed (current state)                                                                                                                                  | Smallest footprint; the procedure stays private.                                                                    |
| 3. Commit a TypeScript runner script without a skill                                                                                                                                                           | Reproducible by others; adds client-specific public maintenance and permission-hook entries.                        |
| 4. Add an in-repository skill that runs fixtures, with telemetry kept external                                                                                                                                 | Discoverable; carries every in-repository cost for a workflow few contributors run.                                 |

Revisit if furn-team adopts evaluation evidence in PR review, a shared evaluation framework is chosen, the method is
proven across repeated multi-client trials, or clients support explicit-only skills hidden from the skill list.

### R09: Contributor new-component guidance

**Status:** Open
**Answer:**

`CONTRIBUTING.md` still describes creating new components with the v1 composition framework in `packages/components`.
Agent guidance now treats v0 and v1 as maintenance-only (D04, `R-V1-001`) and routes new components to the agentic
package. This PR corrected only that section's stale paths.

| Option                                                                                                         | Effect                                                                                    |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1. Update `CONTRIBUTING.md` in this PR to direct new components to `packages/agentic/components` (recommended) | Human and agent guidance agree.                                                           |
| 2. Update it in a separate PR                                                                                  | Keeps this PR scoped to agent guidance; contributors keep conflicting guidance meanwhile. |
| 3. Leave it                                                                                                    | Humans and agents follow different new-component policies.                                |

## Follow-ups outside this branch

- **`native-lib2`:** after this PR merges and that branch rebases without commit `246d33668`, add a route from
  `packages/agentic/native-core/AGENTS.md` to
  [`references/agents/native/apple-office.md`](references/agents/native/apple-office.md). The checker will validate the
  link.
- **External efficacy workflow:** reuse the committed [evaluation fixtures](references/agents/evals/README.md); keep the
  five new holdouts out of instruction tuning; run repeated trials (R06).
- **Publish:** push the branch and open the PR. The evidence below can go in the description.

## Evidence for the PR description

- **Shared references:** reusable guidance moved into [`references/agents/`](references/agents/README.md), with
  standardized frontmatter, `R-` rule IDs, and `C-` evidence claims. Version-bound focus and accessibility observations
  are in `evidence-reference` documents. No compatibility redirects remain.
- **Skills:** added `maintain-v0-v1-component`, `review-component`, and `implement-native-component`. The
  `fix-security-issues` skill went from 1,042 to 371 words by moving its procedures into a reference.
- **Root instructions:** root `AGENTS.md` went from 27.4 KB to 8.0 KB. Copilot CLI loads it twice from the repository
  root, because `CLAUDE.md` imports it.
- **Safety extraction:** permissions (39 sentences), Apple/Office rules (28), and the security skill (60) moved with
  every sentence preserved, confirmed by sentence-level comparison. The focus and accessibility evidence extraction was
  checked the same way.
- **Checker:** `yarn check-agent-instructions`, with 15 tests, validates the following:
  - frontmatter, links, and anchors;
  - code-span paths, skills, and rule IDs;
  - prerequisites: acyclic and at most three reads deep;
  - routing: one skill per row, consistent across routers, and every skill routed from the root;
  - evaluation fixtures (15 cases: 10 development, 5 holdout).
- **Final validation:** `yarn clean-lage-cache` followed by `yarn lage buildci` passed all 171 tasks with none skipped;
  `yarn change:check` and `yarn lage test-links` also passed.

Pilot results, one run per case, read-only Copilot CLI 1.0.98 probes, baseline `a1fd5c65d`:

| Configuration                                                              | Expected skill reached                                                                   | Assertions met                                               | Input tokens | AI usage |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------ | -------- |
| Claude Sonnet 5.5, medium; 10 cases; self-scored                           | Baseline 4/10, candidate 10/10                                                           | Baseline 17/22, candidate 22/22                              | −32%         | −22%     |
| GPT-6.1 Sol, high, long context; 8 development cases; independently scored | Baseline 1/1 available (9 skills absent); candidate 9/10, then 10/10 after a routing fix | Baseline 16 + 4 partial of 20, candidate 20/20 after the fix | −24%         | −9%      |
| GPT-6.1 Sol, high, long context; 5 original holdouts; independently scored | Baseline 2/2 available (3 skills absent); candidate 5/5                                  | Baseline 10 + 1 partial + 1 failed of 12, candidate 12/12    | −17%         | −2%      |

Changes informed by the GPT-6.1 Sol holdouts were rechecked on the same configuration:

- The iOS helper plan stopped reading desktop documents; input tokens fell from 187K to 33K and AI usage by 65%.
- The legacy Callout plan routed directly to native work; input tokens fell 16% and AI usage 20%.

Both cases are now development cases, replaced by two new holdouts.
