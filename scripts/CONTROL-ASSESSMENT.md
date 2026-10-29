# Advisory control assessment: Checkbox pilot

This repository-only tool reads existing native and unit test reports and the reviewed
Checkbox contract. By default it does **not** run tests; `--run-unit-tests` explicitly
runs the existing Checkbox runtime tests. It does not change controls, edit lifecycle
metadata, or approve a release. It currently supports only the agentic Checkbox
in Win32/Paper Storybook. CI collection and an opt-in same-PR publisher are
implemented alongside the local command; they require deployment and the
maintainer setup below before hosted operation can be verified.

For the design, pilot acceptance criteria, and rollout boundaries, start with
[`plan.md`](../plan.md). This draft does not enable the publisher or check in
historical local output as current CI evidence.

From the repository root:

```powershell
yarn assess-control --component checkbox --evidence "apps\storybook\artifacts\desktop\<run-id>\run.json"
```

Reports default to the ignored
`apps\storybook\artifacts\win32\assessment\assessment.json` and `assessment.md`.
Use `--output "path\to\report-directory"` to retain separate assessments.
Omit both evidence inputs to produce an inventory with explicitly missing execution evidence.
At most one native and one unit execution are accepted per assessment. Their
source/build/freshness bindings are checked independently; do not combine different
local/CI revisions into apparent current coverage.

## Unit evidence and choosing the right test

**A requirement does not need both unit and native tests by default.** Choose
evidence that establishes the particular claim:

| Claim                                                                           | Suitable evidence                                                                 |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Defaults, state transitions, callbacks, resolved tokens/styles                  | Complete unit assertions can suffice; no native duplicate is inherently required. |
| Public TypeScript constraints, including `children: never`                      | TypeScript build/type-check evidence, not Jest's stripped types.                  |
| Rendered layout or focus-ring geometry                                          | Layout/visual evidence where those properties are claimed.                        |
| Actual native accessibility dispatch, keyboard focus/navigation, physical input | Native execution for that integration claim; mocked events do not establish it.   |

The initial reviewed unit mapping selects **42 existing runtime cases** in
`checkbox.test.tsx`. It maps applicable JS assertions to parts of CBX-001 through
CBX-005; its remaining gaps identify missing assertions rather than requiring
native duplication of all logic/style tests. It authors no new Checkbox tests.
The mappings remain deliberately partial; full per-requirement completion and
maturity gates have not yet been defined by this pilot.

Additional existing regression cases merged after the initial mapping remain
visible as `unmappedCases`, not credited requirement coverage. The October 29
mapping review confirmed the original 42 assertions and default native callback
are unchanged. Newly added defaults, forwarding, state, anatomy, styling,
native naming, and wrapping tests can be mapped in a follow-up; a reported
mapping gap does not necessarily mean a test is absent.

FURN's existing **JS PR** job already runs package unit tests through
`yarn lage buildci`. The pilot adds assessment and evidence collection, not a new
unit-testing framework. It **does not rerun Checkbox in CI**. An opt-in capture
decorates the existing component package's Jest invocation, preserving its full
file selection, platform, arguments, and exit status while adding JSON output.
The runner is invoked exactly once. JS and native jobs remain parallel; a later
**Assess Checkbox evidence** job validates and combines their artifacts without
running tests or installing dependencies.

The original full-package JSON is retained. The parser selects only
`checkbox.test.tsx` for requirement mapping; it does not count
`checkbox.types.test.ts` as runtime or compiler qualification. Package-wide
counters and failures remain visible. Missing/cached execution without an
exported report remains missing, never a pass. A failure elsewhere in the Lage
aggregate does not erase a separately captured successful component command;
original source-validation failure still stays failed.

The component package's `furn.jestPlatform` is `macos`. CI capture records that
**React Native macOS Jest mock** and rejects conflicting inherited platform
overrides. The explicit local runner selects that same profile.
Eight cases simulate Win32 accessibility action naming/handlers via
`Platform.OS`; this is not native UIA dispatch. The 16 Windows/macOS action cases
and the macOS-only system-focus case remain recorded but are not Win32 requirement
coverage. In particular, that focus case does not establish Win32's custom dual-ring
path. An evidence label describes what ran, not a demand for a second test.

For optional explicit local execution (not used by CI):

```powershell
yarn assess-control --component checkbox --run-unit-tests --max-age-hours 24
```

This invokes the workspace's declared `test` script with the exact runtime-file
selector, `--runInBand --json --outputFile`. Its contract/story prechecks still
run. It does not select `checkbox.types.test.ts` or turn a Jest pass into type
qualification. A fresh UUID-named directory under
`apps\storybook\artifacts\win32\assessment-units\` retains `jest.json`,
`context.json`, and `execution.json`; the assessment JSON links those inputs.
The native input remains optional and is never synthesized.

To replay a report without running anything:

```powershell
yarn assess-control --component checkbox --unit-evidence "path\to\jest.json"
```

Replay without its original context remains unverified. To evaluate a genuine
execution binding, also supply `--unit-context "path\to\context.json"`
`--unit-build-id "<original-build-id>" --max-age-hours 24`. The sidecar binds the
exact JSON bytes, source SHA, dirty flag, contract and unit mapping fingerprints,
mock platform, start/finish times, build ID, and command exit code. Do not create
one retroactively. A dirty checkout remains unverified even after a fresh run;
recorded results remain visible. Native and unit provenance are separate.

The reviewed unit fingerprint covers the runtime test file, package/shared Jest
configuration, Babel configuration, platform constant, and package test script/mock
profile, plus the Jest/capture harness source. Changed assertions or mock inputs invalidate the reviewed mapping even
when test names are unchanged. CI additionally binds the complete tracked tree.
The parser accepts a complete package report but requires exactly one Checkbox
runtime suite. It rejects type-only substitution, duplicate suites or Checkbox
assertion identities, inconsistent names, invalid statuses, contradictory counts,
and oversized JSON. Repeated titles in unrelated parameterized suites are counted
without treating them as Checkbox assertion identities; their failures remain visible.
Jest's `focused` status for nonfailed partially skipped suites is accepted and
counted as an executed suite while individual pending assertions remain skipped.
Skipped/todo/missing cases never become passes. Optional assertion `invocations`
and `retryReasons` retain observed retry counts, retry-success flags and prior
failure messages. Repeated execution disqualifies the enclosing package's passes
even without logged retry reasons; its unit outcome is `retried`, not `passed`.
Enclosing unit-command failure
prevents its recorded passes from qualifying; mapped failures remain visible.

## Assessment snapshot in the agentic SPEC

The pilot targets
`packages/agentic/components/src/components/checkbox/SPEC.md`, **not**
the legacy `packages/components/Checkbox/SPEC.md`. Its existing
`status: implemented` is contract lifecycle, not a maturity rating.

The default local command does not modify tracked inputs. Explicitly add
`--update-spec` to save a generated front-matter snapshot and its linked local
`assessment/ASSESSMENT.md`. The block has flat, canonical `assessment-*` fields
between `# furn-assessment:begin` and `# furn-assessment:end`. It records the
source manifest version, assessed source commit, verified tested commit or
`null`, dirty flag, Win32/Paper Storybook target, outcome, assessment health,
undetermined stage, evidence binding, generation time, and report pointer.

`assessment-source-commit` identifies the assessed checkout/merge, **not proof
that its native tests ran**. `assessment-tested-commit` is populated only for
matched, clean **native** execution evidence. Unit-only evidence does not populate
this native-tested identity or change `assessment-provenance`, which also remains
the native binding. The full report contains separate unit binding and outcomes.
The existing SPEC schema stays v1; its overall outcome/health incorporate unit
failures or stale/mismatched mappings. A dirty or unbound local run keeps the tested commit `null`;
its recorded pass is still visible in the full report. Package version is
descriptive source identity, not qualification of a published npm artifact.
No Backlog/Experimental/Beta/Production promotion is performed.

The publisher is the separate, opt-in task after the **whole source PR
workflow completes**, not a second assessor or a new test runner. It reconstructs
the report and SPEC fields from original evidence using trusted tooling,
then commits both to that PR atomically. It preserves the PR head's contract
bytes, takes version and assessment identity from the tested merge, and never
labels the generated commit as tested. CI collection writes a proposed
`SPEC.md` only in its artifact; it does not edit the tracked SPEC during tests.
Local snapshots explicitly say they are not bound CI publications.
Generated `checkbox/assessment/` report files are excluded from the component's
npm pack inventory; the linked report is browsed in the source repository.

After CI deployment, the **Assess Checkbox evidence** job combines the existing
**JS PR** unit report and **Win32 Storybook PR** native bundle and produces files in
`apps/storybook/artifacts/win32/assessment-ci/`. Open the PR's associated
Actions run, select **Summary**, and download
`checkbox-win32-assessment-<run-attempt>` under **Artifacts**. It contains
`ASSESSMENT.md`, `assessment.json`, `bundle.json`, proposed `SPEC.md`, and
execution capture data and original package Jest JSON/unit context. The source
artifacts are `checkbox-unit-evidence-<run-attempt>` and
`checkbox-native-evidence-<run-attempt>`, downloaded to separate directories to
avoid overwrites. All three are retained for 14 days. The readable
report is also written to the job summary. These are workflow artifacts,
not PR file changes; only subsequent publisher commits appear in **Files
changed**. No hosted artifact is implied while this pilot remains undeployed.

### Historical local validation, October 26, 2026

These dated results document the earlier local checkpoint, not validation of
the current draft PR. See the PR description for its current checks and limits.

The full tooling suite passed **228 tests across 18 suites**, with no failures
or skips. Scripts build/lint, root TypeScript build/repository lint,
instruction/publishing checks, component contracts, and all three workflow
checks passed. The existing normal component command passed **561 tests across
66 suites and 8 snapshots in one Jest invocation**. Replaying its original JSON
selected **42 Checkbox runtime passes** without launching tests or treating
other-component/type suites as Checkbox evidence. Local replay has no original
execution context, so it remains unverified and assigns no maturity stage.

The required clean-cache plain aggregate reported 95 successful and 1 failed
Lage task before stopping. The continuation completed with **82 successful,
89 skipped, and 4 failed tasks**. The aggregate is **not green**: the unchanged
Windows package-content launcher fails with `spawnSync yarn ENOENT`, two
unchanged codemod newline fixtures fail, and unchanged Desktop Driver and
Storybook Desktop tests fail under parallel load. All timeout-affected files
passed isolated serial retry with original assertions/deadlines: Storybook
Desktop **10 tests/4 suites**, Desktop Driver **7 tests/1 suite**. These retries
do not erase aggregate failures or establish native qualification.

At that checkpoint, the base pilot was committed locally and the unit extension
was uncommitted and unpushed. Hosted collection/publication had not been activated. The following
SPEC-only checkpoint is historical, not the current unit-extension result.

### Prior SPEC snapshot validation, October 26, 2026

The final tooling suite passed **189 tests across 16 suites**, with no failures
or skips. Scripts build/lint, root TypeScript build/repository lint, all 24
component contract checks, instruction/publishing checks, and formatting passed.
All 561 component tests across 66 suites passed in the aggregate. Actual
`yarn pack --dry-run --json` confirmed that SPEC is included and generated
assessment reports are excluded. The real local SPEC snapshot preserves every
original contract byte and the reviewed mapping digest. All 20 retained native
run files and eight older evidence/report hashes remain unchanged.

The clean-cache aggregate and continuation were run; the final continuation
reported 83 successful, 88 skipped, and 4 failed Lage tasks. It is **not a
green aggregate**. The Windows package-check launcher still fails with
`spawnSync yarn ENOENT`, and two unchanged codemod newline fixtures still fail.
The other failures were in unchanged desktop packages under aggregate load;
all their affected suites passed isolated serial retry with original assertions
and deadlines: Storybook Desktop 11 tests/5 suites, Desktop Driver 7 tests/1
suite. These retries do not erase the original aggregate failures or establish
new native qualification. Hosted activation remains pending.

The generated block is a snapshot, not a live claim about a subsequently
changed contract. Do not edit it manually. Only its strictly validated,
bounded schema is normalized out of fingerprints. Unknown/duplicate fields,
invalid identities, malformed markers, and content injected into the block
are errors. All surrounding front matter and the full human-authored body
remain fingerprinted. Trusted follow-up verification compares **both** files
byte-for-byte with the original evidence rendering, so plausible but altered
metadata cannot authorize reuse.

## What the pilot evaluates

All six `CBX-*` requirements are loaded from Checkbox's `SPEC.md` and
`spec/source.json`. Metadata evidence filenames remain **declared references**,
not passing results.

The single existing named native case,
`components-checkbox--default` / `toggles native checked state in both directions`,
provides partial mappings for CBX-002 (binary uncontrolled transitions) and CBX-004
(native checkbox role). Neither complete requirement is covered by that case.
A multi-assertion case failure blocks both mappings; it does not identify exactly
which individual requirement is defective.

The remaining gaps are explicit. The unit adapter above supplements the native
case; type/build/visual/manual adapters remain unimplemented. The pilot authors
no new Checkbox tests. A passing native
case therefore **cannot establish complete readiness**.

The current default is the schema-v1 **desktop-test canonical report**, introduced
by PR #4389 (merged October 23, 2026), plus its declared Storybook smoke companion:

```text
apps\storybook\artifacts\desktop\<run-id>\run.json
apps\storybook\artifacts\desktop\<run-id>\evidence\win32\static\run.json
```

Pass the canonical `run.json`; keep the complete run directory together. The
assessor loads its companion automatically. It checks supervisor failures,
unfinished work, attempt history, counts, timestamps, and callback identity/status
against the smoke results. Navigation and portable/static checks are not
Checkbox requirement coverage. Retried/flaky runs and cleanup/evidence failures
cannot qualify a passing case in this conservative pilot.

Historical direct Desktop Driver `tests` reports and schema-v1 Storybook smoke
`wdio` reports remain supported for replay. Smoke `tests` entries are portable/legacy evidence and are not
mistaken for native WDIO results. Enclosing `"status": "passed"` never converts a
named skipped case into a pass. Invalid JSON/schema, duplicate identities,
contradictory statuses, and unreadable files are errors.

## Provenance and policy

Existing direct reports have no source commit, build ID, or timestamp. Smoke
reports add timestamps but still lack full provenance. The assessor records their
outcomes as observations, not current qualification. File modification times,
current checkout identity, and manifest hashes alone do not establish execution
identity.

For local runner integration, an optional **execution-generated** sidecar can
bind provenance claims to the exact UTF-8 evidence bytes. For canonical input,
these are a JSON envelope containing `schemaVersion: 1`, `format: "desktop-test"`,
and the exact original canonical and smoke JSON strings as `desktopRun` and
`storyReport`. `reportSha256` hashes that envelope as returned by
`readNativeEvidence()`, not either file alone. Historical direct/smoke input still
hashes the original report bytes. Do not construct a sidecar
retroactively from the current checkout to make old results appear current.
This is correlation metadata, not a cryptographic execution attestation.

```json
{
  "schemaVersion": 1,
  "reportSha256": "<64 lowercase hex characters: SHA-256 of the accepted evidence bytes>",
  "sourceCommit": "<40 lowercase hex characters: execution source commit>",
  "buildId": "<execution build ID>",
  "contractDigest": "<digest of contract/mapping inputs used by the execution>",
  "platformManifestDigest": "<64 lowercase hex characters from the report>",
  "endpoint": "win32",
  "renderer": "paper",
  "targetId": "<Win32 target ID captured by the runner>",
  "finishedAt": "2026-10-21T20:00:00.000Z",
  "physicalClick": true
}
```

Use `--context "path\to\context.json" --build-id "<expected-build>"
--max-age-hours "<explicit-positive-limit>"` when real runner context is
available. For the current harness, also supply
`--target-id "win32-<16-hex-instance-id>"` from the runner's pre-execution identity;
the context and report must both match it. New IDs derive from the real app root,
endpoint, and renderer, so they differ between checkouts. The old fixed
`agenticstorybook-win32` identity remains accepted for historical report formats,
not as a replacement for the new instance binding. CI captures the expected
Win32/Paper Storybook ID before smoke and rejects a different instance.
The hash protocol has a regression check against the actual upstream resolver.
No default age or stage threshold is invented. Context must match the
report, current source revision, contract inputs, expected build, native target,
and manifest; its time cannot be in the future or contradict a smoke report.
A dirty target working tree remains unverified because its commit does not
identify the changes. Supplied context is still only a claim, and full readiness
remains unsupported in this pilot.

The reviewed mapping fingerprint covers, in order, `SPEC.md`, `spec/source.json`,
`spec/interaction.md`, `spec/accessibility.md`, `spec/tokens.yaml`, `spec/usage.md`,
and `checkbox.stories.tsx`, followed by the assertion-bearing helper
`packages/agentic/components/src/common/desktopFocus.wdio.ts`.
Hash input is each listed filename (component-relative for the first seven,
repository-relative for the shared helper), a NUL, its
UTF-8 content normalized to LF, and a NUL, after removing only the validated
generated SPEC assessment block. Any other changed input invalidates the
mapping. Review the contract and exact assertions before deliberately updating
the pinned digest in `src/tasks/controlAssessment.ts`; do not merely refresh it
to silence a stale result.

## Reading the output

`assessmentHealth` describes whether the assessment is complete, stale, or blocked.
`assessmentOutcome` distinguishes insufficient evidence, a qualifying native/unit
case failure, and runner failure. Native `check` and unit `unitChecks` remain
separate under each requirement. Each mapped check separates `recordedOutcome`
from `evidenceOutcome`; only matched current evidence can qualify.

`declaredStatus`, `evidenceSupportedStatus`, and `approvedStatus` are null.
The contract's `implemented` / `reviewed` metadata is preserved separately and
is **not** converted to Backlog, Experimental, Beta, or Production. Maturity gates
and approvals require a separate agreed policy.

Exit code **0 means the advisory reports were generated**, not that the control
is ready. With `--run-unit-tests`, a failed executed unit command also returns
nonzero after retaining available assessment evidence. Invalid inputs or failed
report writes return nonzero. This is not a
release gate. The CI integration checks report integrity and publication, not
Experimental/Beta/Production qualification.

## Same-PR CI pilot (Option 2)

The hand-authored integration is in `.github/workflows/pr.yml`,
`.github/workflows/pr-control-assessment.yml`, and
`scripts/src/tasks/controlAssessmentCi*.ts` plus `controlAssessmentGithub.ts`.
No additional native framework or input-capable runner is provisioned.

1. Ordinary source PRs run the existing jobs. The JS job captures source before
   its unchanged `yarn lage buildci`; the existing component Jest invocation
   exports a full-package JSON report and execution context exactly once.
   The independent Win32 Storybook job uses Node 24, retains hosted
   `keyboard,physicalClick,wheel` disabling and captures source before native
   execution. Its capture inventories existing
   `artifacts/desktop` run directories; collection accepts exactly one new run
   and checks its ID and execution time. It never deletes/reuses an old run or
   selects an arbitrary newest report. Missing/unfinished output is explicitly
   unavailable, and multiple fresh runs are an ambiguity error. Unit/native jobs
   do not depend on one another. No `continue-on-error`, test rerun, or
   permission/input-capability bypass is used.
2. The **Assess Checkbox evidence** job waits for JS and Win32 results and runs
   even after an ordinary source-job failure. It downloads separate same-attempt
   artifacts, validates matching repository/PR/head/base/tested SHA/tree/run/attempt,
   report hashes and each source's own execution interval, and combines them.
   Unit execution may precede native capture; cross-job evidence is not falsely
   required to fall inside the native execution interval.
   It never selects JSON by modification time or executes tests. Missing source
   artifacts are reported as unavailable. Failed original source checks remain failed.
   Collection writes `bundle.json`, `assessment.json`, `ASSESSMENT.md`, and a proposed `SPEC.md` in
   ignored `apps/storybook/artifacts/win32/assessment-ci`. The readable report
   also appears in the job summary. Artifact name:
   `checkbox-win32-assessment-<run-attempt>`, retained for 14 days.
   New assessment JSON and CI bundles use schema v2. The trusted reader explicitly
   accepts native-only v1 bundles, but rejects unit fields smuggled into v1.
   Trusted reconstruction reads reviewed unit inputs from the tested Git tree,
   not PR-supplied assessment output, and executes no PR unit code with write credentials.
3. An opt-in, default-branch `workflow_run` publisher validates that data and
   recomputes the advisory assessment using trusted tooling. It does not check
   out, install dependencies from, or execute PR code with a write credential.
4. For an eligible same-repository PR targeting the default branch, a narrowly
   scoped GitHub App atomically commits **only**
   `packages/agentic/components/src/components/checkbox/assessment/ASSESSMENT.md`
   and the generated assessment fields in the adjacent `SPEC.md`
   to the existing PR source branch. It preserves every other SPEC byte and
   never writes to main or merges a PR.
   The API's `expectedHeadOid` rejects a branch race; newer source results must
   be used instead of force-pushing or appending stale evidence.
5. The report commit triggers a follow-up PR run. Trusted input validation
   downloads the original attempt's bundle, verifies the exact rendered report and SPEC,
   checks all tracked inputs, and retrieves the original source-validation
   result from GitHub. Only then may expensive jobs be skipped. A failed or
   unrun source-validation job cannot become successful through a report commit.
6. Report-only verification runs do not create native assessment artifacts, so
   the publisher makes no further report commit. The bundle-size commenter also
   handles the absence of its artifact on those runs.

The existing required check is still named **PR**. Its source-check aggregation
is now separately visible as **PR source validation**. With publishing enabled
for an eligible PR, the initial **PR** check deliberately fails with a
"waiting for the trusted publisher" message after source validation. This
prevents merging before publication. The report-only follow-up replaces it with
a successful **PR** check only if both the source result and report verification
pass. This temporary publication failure is not a control-readiness rating.

Without opt-in, CI still collects reports and the required check preserves normal
source-validation behavior. Fork PRs and non-default-target PRs retain CI
reports, but the pilot does not write their branches or require automatic
publication. No fork token, maintainer-edit assumption, approval bypass, or
branch-protection exception is used.

### Tested source, report commits, and freshness

`sourceCommit` remains the actual tested PR **merge revision**, not the later
report commit. The summary separately records PR head, tested base, source
workflow run and attempt, generation time, and the input digest.

The CI digest hashes Git tree entries, including blob IDs and file modes, for
**every tracked file except the exact generated summary path**, with only the
validated SPEC assessment block removed before recomputing that SPEC's blob ID.
The original mode and path remain inputs. A SPEC without the generated block
retains its previous digest unchanged. Tests,
specifications, code, all dependency files, workflows, formatting policy, and
other configuration are inputs. This deliberately conservative pilot does not
attempt dependency-graph impact analysis. Another control change can therefore
invalidate reuse.

Reuse requires a single two-file report/SPEC commit directly after the tested PR head,
the same complete input digest in the new merge tree, the matching original
workflow attempt and PR, and byte-for-byte equality of both files with trusted renderings.
It does not use the cumulative PR diff or merely inspect the latest commit.
The explicit CI reuse limit is **168 hours**; this is an operational evidence-age
limit, not a maturity-stage policy. Older references cause a full source run.
Deleted or expired original artifacts cannot authorize a report-only fast path.
The original local CLI still requires an explicit `--max-age-hours` value.

Legacy summary-only publications fall back to full source CI rather than
receiving an unchecked exemption. Malformed SPEC assessment metadata fails
explicitly; valid but altered generated fields fail exact reconstruction.

The summary says **AUTO-GENERATED. DO NOT EDIT**. Its sole formatter exclusion
prevents a source formatter from changing evidence-bound output. Do not exclude
the entire control, its specifications, or its tests. The SPEC renderer uses
the repository's single-quoted YAML style and does not require a SPEC-wide
formatting exemption.

### Maintainer activation and first hosted trial

Deployment is not implied by local validation:

1. Review and merge the collector, trusted validator, publisher workflow, and
   tooling to main **with publication disabled**. `workflow_run` needs its
   workflow on the default branch. The bootstrap PR runs full CI if the trusted
   validator is not yet on its base branch.
2. Install a dedicated GitHub App on **only this repository**, granting
   `Contents: write`. It needs no Actions-write, Workflows-write,
   Administration, review-approval, or protection-bypass permission.
3. Configure repository variable `CONTROL_ASSESSMENT_APP_CLIENT_ID` and secret
   `CONTROL_ASSESSMENT_APP_PRIVATE_KEY`. Keep the private key out of source and
   logs. The action requests only `contents:write`, scopes the token to the
   current repository, and revokes it when its job finishes.
4. Have a maintainer verify organizational Actions execution policies, the App's
   permitted branch writes, and fork-run approval behavior. No policy is
   weakened by this pilot.
5. Set repository variable `CONTROL_ASSESSMENT_PUBLISH=true` only after setup.
   Open a same-repository pilot PR, then observe source CI, the single report
   commit, trusted report-only validation, and the final required **PR** check.
   Verify one failed source check stays failed, a newer source push rejects stale
   publication, and concurrent Checkbox PRs regenerate reports after conflicts.

If the publisher is misconfigured, the eligible PR remains blocked rather than
merging without its report. Disabling the opt-in restores the ordinary artifact
flow; changing a variable may require rerunning the PR workflow. This does not
change the repository's branch rules.

### Merge conflicts and concurrent changes

When two Checkbox PRs conflict, resolve actual source conflicts first. Keep
main's generated report and assessment block temporarily rather than merging assessment prose,
update the PR branch, and rerun source CI. The publisher regenerates the summary and SPEC snapshot
for the updated inputs. GitHub's ordinary `pull_request` workflow will not start
while conflicts remain.

After a newer source commit, closed PR, unavailable merge revision, different
merged inputs, or unsupported fork, publication explicitly reports why no commit
was made. Permission and API failures are errors, not successful empty reports.
There is no force push, automatic source-conflict resolver, auto-approval, or
automatic merge.

### FURN rules verified October 21, 2026 (Pacific)

Read-only API inspection found active main ruleset **12778298**:

- One approving review; stale-review dismissal **off**, latest-push approval
  requirement **off**, code-owner review requirement **off**.
- Review-thread resolution required; only squash merges allowed.
- Required status context **PR**, GitHub Actions integration **15368**.
- Strict up-to-date checking **off**. The report identifies the tested
  integration tree; it does not promise compatibility with every later main
  revision.
- Extra approval for unattributed Copilot PRs is enabled. This is not a blanket
  exemption for generated reports; applicable repository rules still govern.

The inspecting account had read-only repository access. Actions settings
endpoints returned **403**, so organization execution policy, default workflow
permissions, and fork-contributor approval configuration were **not verified**.
The legacy branch-protection endpoint returned **404**; that does not negate
the active ruleset returned by the effective branch-rules API.

The published rules permit the Option 2 design; they do not establish that an
App is installed, that secrets exist, or that hosted publication has run.

## Historical October 26, 2026 migration checkpoint

Local main was fast-forwarded to
`01ab9fee6dbf40de9cec40926f8aa8d68193d446`, including Jason's PR #4389.
The reviewed Checkbox mapping digest changed only after checking the upstream
focus-document link relocations and unchanged mapped assertions. No new control
test, maturity policy, publisher permission, or native input capability was added.
The legacy desktop Appium and mobile lanes were not removed by #4389.

A replay of PR #4389's actual Win32 artifact (Actions run `39868561037`, attempt
1, desktop run `bfcbec99-2712-4449-9722-81dac06a02cd`) successfully parsed the
canonical result and companion: supervisor passed; Checkbox interaction skipped
because physical pointer input was disabled. This is historical artifact replay,
not a new native test or current qualification.

Scripts build/lint and all **174 tests passed** (15 suites, no skips). Tests
include canonical reporting, incomplete/ambiguous/missing evidence, retries,
target-ID conformance against the real upstream resolver, target mismatch,
actual CLI entrypoints, publication, and report-only verification.
Actionlint 1.7.12 passed for all three pilot workflows. Formatting checks and
`git diff --check` passed. These are local tooling checks, not native qualification.

**Immutable dependency restoration now passed.** The corporate registry supplied
`ip-address@10.7.4` and `zod@4.6.7`. The final missing package,
`storybook@10.6.3`, was recovered from public CDN files over verified HTTPS.
Its reconstructed Yarn cache archive matched the **entire original lockfile
SHA-512 checksum**, before any recovered package code was executed. Offline
`yarn install --immutable`, with checksum behavior `throw`, then succeeded with
peer-dependency/linker warnings. The lockfile and package versions are unchanged;
no certificate validation, permission, or integrity check was bypassed.
Registry/auth overrides were process-local. This repairs the local cache, not
the normal registry TLS route; a future cache miss may still need that route fixed.

The Storybook update from 10.6.0 to 10.6.3 came from Dependabot PR #4387 on
October 23, not Jason's #4389. The app already declared `storybook: ^10.4.0`;
the lockfile selects the exact version. This is an existing npm development
dependency, not another desktop application or a binary to commit into Git.

The required clean-cache aggregate now reaches actual validation. Root
TypeScript build, repository lint, agent-instruction checks, and publishing
checks passed. It is **not entirely green**: the unchanged upstream
`checkPackageContentsTask.ts` invokes `execFileSync('yarn', ...)`, which fails
with `ENOENT` on this Windows setup for all eight guided packages. Directly
spawning the available `.cmd` shim also reproduces `EINVAL`. That task came
from upstream PR #4393 and was not changed by this pilot. This is not the old
stale-pnpm-map failure or proof that the entire pre-sync baseline persists.

The continuation completed with **82 successful, 88 skipped, and 5 failed Lage
tasks**; those are task statuses, not native test-case counts. The scripts
regression suite passed again after restoration, as did the neutral
`desktop-test` suite. Besides the package-content check, both unchanged codemod
fixture tests failed with newline-only output differences. Three other
workspace tasks failed on timeouts during the parallel aggregate. All their
affected suites passed on isolated serial retry with unchanged assertions and
time limits: Storybook Desktop 11 tests, Desktop Driver 7, and agentic components
73 (**91 tests across 11 suites**). This is evidence of load-sensitive failures,
not a clean aggregate pass or native qualification. The upstream packages and
their test sources are unchanged by this pilot.

Post-restore CLI replay of the real canonical artifact also passed, preserving
insufficient evidence and null maturity statuses.
**Fresh local native verification now passed.** After generating the current
manifest, bundling Win32, explicitly building the helper, and passing its
prebuilt-only `doctor`, the current harness completed desktop run
`740c6879-528f-46f2-818f-3eb36b5fbd34` on October 26, 20:19:33-20:21:33 UTC.
It recorded 166 story-navigation passes and the one Checkbox callback pass:
unchecked -> checked -> unchecked through physical clicks. All 167 selected
checks passed, with no skips, failures, retries, flaky results, incomplete work,
or harness failures. The story filter selected the Checkbox callback; it did
not reduce the harness's full story traversal.

Run app-owned commands from `apps/storybook`, or select its workspace explicitly
from the repository root, for example:

```powershell
yarn workspace @fluentui-react-native/agentic-components-storybook storybook bundle --win32
yarn workspace @fluentui-react-native/agentic-components-storybook storybook build-driver --win32
yarn workspace @fluentui-react-native/agentic-components-storybook desktop-driver doctor --platform win32
$env:STORYBOOK_SMOKE_STORY = 'components-checkbox--default'
$env:FURN_DESKTOP_DRIVER_BUILD_POLICY = 'never'
yarn workspace @fluentui-react-native/agentic-components-storybook storybook smoke --win32 --mode stories-and-tests
```

The environment overrides above are process-local; clear the story filter
before selecting other controls. Win32 uses the prebuilt REX Paper host: the
bundle and native helper are built, not a new native Win32 app host.

The assessor consumed that actual canonical run and its companion. It preserved
one passed case, zero skipped cases, and the current reviewed mapping, while
correctly reporting `insufficient-evidence` and null maturity statuses. Local
execution has no bound CI provenance and the checkout is dirty; no context or
attestation was fabricated. The native case still covers only parts of CBX-002
and CBX-004. Navigation passes do not become requirement coverage.
The full run's 20 files were retained byte-for-byte with a SHA-256 inventory in
the user's FURN evidence folder, with a separate assessment and local provenance
note; historical evidence and CI skips were preserved.

No hosted collector, GitHub App publication, or required-check transition was
run. A fully green repository aggregate is not claimed.

At this checkpoint, the original pre-sync pilot was retained in a named Git stash
and migration changes remained local, uncommitted, and unpushed.

## Historical pre-sync validation (October 21-22, 2026)

The owning scripts workspace build, lint, and all **112 tests passed**.
Tests cover actual CLI entrypoints and disposable Git histories, including
report-only reuse, changed inputs, failed source checks, stale publication,
branch races, fork rejection, and concurrent generated-report conflicts followed
by regeneration. Write API calls use test doubles; these are not hosted trials.
Actionlint 1.7.12 passed for all three changed workflows.

The required clean-cache `yarn lage buildci` run failed on the same 11 Knip
unused dependencies previously reproduced on the unchanged baseline. A
continuation run completed with 84 successful tasks, 85 cached/skipped tasks,
no pending or aborted tasks, and two failed tasks: repository lint and the
legacy codemod test task (two failing tests). The root TypeScript build,
agent-instruction checks, repository formatting, and scripts tests passed.
These baseline failures have not been hidden or changed.

No new native execution was performed for this CI implementation. Hosted
collection, GitHub App publication, and required-check transitions were
**not run** at that checkpoint, pending maintainer deployment and configuration.
None of these historical results constitute hosted activation.

Run the owning workspace tests with:

```powershell
yarn workspace @fluentui-react-native/scripts test
```
