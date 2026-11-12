---
id: components.assessments
kind: instruction-reference
owner_paths:
  - packages/agentic/components
---

# Advisory component assessment

Assessment explains what existing test results establish against reviewed requirements, and what remains unproven.
It is not a new test framework or release gate. A successful command means that reports were generated, not that a
control is ready. The assessor calculates an **advisory evidence-supported level** under a provisional versioned
policy; it does not change component lifecycle metadata or establish production qualification.

The shared implementation lives in `@fluentui-react-native/scripts/src/ci/assessment/`; its workflow entrypoint is
`@fluentui-react-native/scripts/src/ci/controlAssessmentCiTask.ts`. Normal developer commands remain in
`@fluentui-react-native/scripts/src/tasks/assessControlTask.ts`. This package owns its control definitions and guidance.
See [Checkbox](checkbox.md) for the original pilot's coverage and [remaining work](../remaining-work.md) for open work.

## Skill-led workflow

The `assess-agentic-component` skill is the primary assessment workflow. It runs on explicit assessment requests and
after implementation validation in the component-authoring workflow. Existing CI runs tests and captures evidence;
it does not replace the skill's semantic review or independently prove checklist completeness. CI may publish the
deterministic evidence projection even when no agent has refreshed a stale mapping.

1. Select the requested contract through discovery. Assess higher-order components and public primitives explicitly;
   never silently omit a missing contract, unconfigured control, or unsupported endpoint.
2. Read the entire local contract and its normative companions before examining coverage. For a higher-order component,
   include the public API/defaults, finite variant/state axes, anatomy, interaction, accessibility, focus, token bindings,
   divergences, and source metadata. A primitive uses its local `CONTRACT.md`; do not invent an upstream Flex source.
3. Derive or reconcile a complete requirement-first acceptance checklist independently of the tests that happen to
   exist. Split distinct acceptance claims, including negative cases, precedence, ownership, platform differences,
   and native/visual obligations. Keep `tests: []` for unproven checks. Listing each requirement ID is not a semantic
   completeness proof.
4. Read the actual assertion bodies and assertion-bearing helpers before linking evidence. Unit links use exact Jest
   full names. Native identities are `storyId::callbackName` and preserve target and input-lane scope. Compiler links
   identify the actual compiled type-test file. A source filename, snapshot count, mocked platform branch, or native
   capability declaration alone proves no behavior.
5. When maintaining a mapping, record every additional reviewed helper in `reviewInputs`. Update the reviewed digest
   only after completing the semantic review, using the discovery tool's current digest. Never refresh hashes merely
   to suppress stale findings. Checkbox's schema-v2 matrix retains its separately reviewed native and unit bindings.
6. Reuse fresh, correctly scoped execution evidence. Run the package assessment command below to validate bindings and
   project test results onto the reviewed checklist. Default assessment runs no tests. If evidence is missing, state
   that gap; run a needed suite only when authorized by the task, using its owning declared commands and desktop-testing
   workflow. Do not repair unrelated tests, change host exclusions, alter privacy settings, or enable unavailable inputs
   as part of assessment.
7. Evaluate the six readiness dimensions under the versioned provisional policy. Resolve current upstream drift from
   fresh source observations, not local hashes. Distinguish machine-verifiable assertions from visual/manual review,
   actual platform keyboard/screen-reader observations, API commitments, and token-gap decisions. Preserve unresolved
   contract ambiguities rather than awarding complete coverage.
8. Return the advisory evidence-supported level or insufficient-evidence result, limiting dimensions, exact source/build
   and target scope, covered and uncovered checks, observed failures/skips, and next missing evidence. There is no
   mandatory owner approval step for this report. Optional declared/approved status is separate; neither authorizes
   the skill to ratify policy, approve its own manual observations, or claim production qualification.

The skill may maintain assessment metadata and ignored reports. Changes to component behavior, tests, contracts, CI
permissions, policy adoption, and official consumer maturity markers require their separate task/workflow. Reassessment
does not restart component implementation or make native jobs required checks.

## Full-inventory assessment

```powershell
yarn workspace @fluentui-react-native/components assess-components --list
yarn workspace @fluentui-react-native/components assess-components
yarn workspace @fluentui-react-native/components assess-components --component switch
yarn workspace @fluentui-react-native/components assess-components --evidence-directory "C:\evidence"
```

Default execution reads evidence; it does not rerun tests. Reports are written to ignored
`apps/storybook/artifacts/readiness/report/` artifacts. `--evidence-directory` is repeatable for local execution receipts
and reviewed observations. CI instead consumes only its captured workflow evidence and prohibits local replay/output
overrides. `yarn lage assess-components` invokes this command from participating workspaces.

Ordinary local `yarn test` output is not a qualified execution receipt. Enable capture before the already-needed
test invocation to retain its original source, input, and build identity. From the repository root:

```powershell
$capture = Join-Path $PWD ("apps\storybook\artifacts\readiness\unit-local-" + [guid]::NewGuid())
$previousCapture = $env:FURN_ASSESSMENT_UNIT_CAPTURE
try {
  $env:FURN_ASSESSMENT_UNIT_CAPTURE = $capture
  yarn workspace @fluentui-react-native/components test
} finally {
  if ($null -eq $previousCapture) {
    Remove-Item Env:\FURN_ASSESSMENT_UNIT_CAPTURE
  } else {
    $env:FURN_ASSESSMENT_UNIT_CAPTURE = $previousCapture
  }
}
node scripts\src\ci\readinessCiTask.ts collect-unit --input $capture --output "$capture-collected"
yarn workspace @fluentui-react-native/components assess-components --evidence-directory "$capture-collected"
```

Use this around the existing authoring test step, not as a second run after validation. Local receipts are explicitly
local, never fabricated GitHub runs, and cannot satisfy same-attempt CI proof. Dirty or changed inputs remain
non-qualifying. If capture did not run before execution, retain the gap; the legacy replay commands can inspect
local Jest JSON, but retrospective provenance does not establish readiness.

The owning package's `furn.readiness.contracts` patterns discover every higher-order `SPEC.md` and primitive
`CONTRACT.md`. Both paragraph and bullet requirement formats are supported. Local primitives have stable,
contract-ordered `LOCAL-001`-style paragraph identifiers; they do not need invented upstream provenance. Missing
mappings remain visible and cannot earn coverage.

`assessment.readiness.json` lives beside each contract. It records a requirement-first acceptance checklist, normative
references, exact evidence links, reviewed input digest, additional shared assertion helpers, and limitations.
`agent-reviewed` records the review's origin, **not an owner endorsement**. Empty test-link arrays deliberately retain
uncovered acceptance checks. A test file, implementation filename, or planned-evidence hint alone proves nothing.
Changes to reviewed clauses, assertions, helpers, or snapshots invalidate the mapping. Checkbox's existing schema-v2
matrix is adapted directly, retaining both original reviewed fingerprints and its limited approved-link scope.

Each acceptance check has a cumulative `requiredFrom` level. Defaults are `preview` for unit/compiler evidence,
`beta` for native/visual evidence, and `stable` for reviewed manual evidence. An explicit level can defer a check,
but cannot move its evidence kind below that minimum. Preview needs its applicable preview checks, not every future
beta/stable check; all future gaps and failures remain in the report. Compilation proves public type contracts,
not runtime defaults, ref lifetimes, handler composition, or style precedence; those are separate checks.

Native, visual, and manual checks are evaluated separately for every supported target. An unscoped link must match
its exact assertion on every applicable target, preserving any declared input lane. Per-target `applicability` may
record `not-applicable` or `unsupported`, with a normative contract `source` and explicit `reason`. Not-applicable
stays visible and is excluded from required coverage, never turned into a pass. Unsupported remains a blocker even
when a passing observation exists. A check with no native obligations does not acquire a native pass.

Use `qualification: "keyboard"` on contract-owned native/manual keyboard checks and
`qualification: "screen-reader"` on actual reviewed manual screen-reader checks. Stable qualification records must
name the exact reviewed assertions, target, scenarios, and keyboard/assistive-technology environment. Accessible
automation cannot replace screen-reader evaluation. Static/unstyled primitives do not inherit consumer-owned
keyboard or token decisions. The legacy Checkbox mapping conservatively retains keyboard and screen-reader
qualification requirements on all targets until migrated through a full semantic mapping review.

Native evidence is separated into **Win32/Paper, Windows/Fabric, macOS/Fabric, and macOS/Paper** targets. Accessibility
and physical input remain separate evidence scopes, including when a source run contains both. Existing catalog
exclusions and unavailable physical capabilities stay gaps. Jest's macOS mock profile is not native macOS evidence;
an accessibility-input pass is not screen-reader conformance.

The PR workflow wraps the existing five native Storybook invocations rather than launching duplicate suites. It
collects the existing package Jest execution once and captures a separate, forced project-reference compiler build;
a Jest type-test pass or cached aggregate build is not compiler proof. Same-attempt artifacts are combined after all
source jobs finish, including failures. Native source jobs and the assessor remain advisory, not newly required
promotion gates. Original schema-v2 artifacts and trusted publication remain available independently.

## Provisional maturity workflow

The [versioned policy](readiness-policy.json) implements #4251's proposed
`experimental → preview → beta → stable` ladder; `deprecated` is an explicit terminal decision, not a failed-test
classification. It evaluates fidelity, contract coverage, accessibility, platform validation, API stability, and token
completeness. Missing required evidence limits the computed ceiling; new failures or expiry can lower it.
Version `4251-provisional-v2` applies stage-specific cumulative checks and contract-backed target/qualification ownership.

The normal loop is **component change → existing builds/tests → evidence validation → automatic level and gap report**.
There is no separate approval step required to calculate or publish an advisory level. The policy itself is provisional,
not an already adopted project standard.

`declaredStatus`, `evidenceSupportedStatus`, and optional `approvedStatus` remain distinct. An owner-approved designation
is an optional additional publication, not approval of every test run. No owner approvals are supplied by this change.
Reviewed manual observations, such as actual keyboard or screen-reader evaluation, are evidence rather than approval
of the overall verdict. Authentication and expiry protect those records from being treated as fresh facts merely
because a JSON file names a reviewer.

Visual comparisons and reviewed manual evidence must identify the tested control, source/build, target, observation,
and artifact hashes. API commitments, token-gap decisions, platform sign-offs, and upstream-source observations need
their own scoped evidence. Local fingerprints establish changed local inputs, not that a pinned external specification
is still current. Absent or unresolved upstream drift therefore remains a fidelity blocker.

## Legacy compatibility commands and discovery

The sections below describe the schema-v2 replay and trusted publication path. Explicit native/unit replay options,
`--run-unit-tests`, `--update-spec`, and the `assess-control` alias retain that behavior; they do not assign maturity
or borrow wider-platform evidence from the new readiness report.

From the repository root:

```powershell
yarn lage assess-components
```

Lage invokes each package that declares `assess-components`. This package delegates to `fluentui-scripts assess-components`.
The task is deliberately uncached: execution evidence, freshness, and the current workflow attempt must be checked each time.
Assessment is not part of `buildci`, because its final CI execution must wait for the existing native and JS jobs.

To list this package's configured and unconfigured controls without assessing them:

```powershell
yarn workspace @fluentui-react-native/components exec fluentui-scripts assess-control --list
```

The command discovers the package's `furn.assessments` entries, rather than assuming a particular control name.
Each entry points to one `src/components/<control>/assessment.mapping.json`, beside that control's `SPEC.md`.
Controls with a SPEC but no configured mapping are reported as `not-configured`, never passed or implicitly mapped.
An explicitly requested unconfigured control fails. Ordinary PRs currently assess all configured controls, not only
ones affected by the diff.

Each schema-v2 mapping declares:

- component ID, display name, and package-relative component directory;
- contract files, assertion-bearing native helpers, reviewed fingerprint, mapping version, exact native callback,
  physical-input requirement, and a requirement-first matrix of specific acceptance checks;
- package-relative runtime test files, repository-relative unit fingerprint inputs, declared Jest mock platform,
  reviewed unit fingerprint, and an explicitly excluded case inventory;
- control-specific limitations.

The owning package supplies its workspace name and declared test script. Shared capture and evaluation code does not
contain a control catalog or hard-coded test filenames. Definitions are data, not executable configuration. Invalid
paths, duplicate controls or assertion identities, unknown requirement references, and a conflicting Jest profile fail
explicitly. A filename or a SPEC evidence reference alone never proves requirement coverage.

## Requirement-first mapping

The mapping describes **what must be checked and which tests check it**, not execution results:

```json
{
  "CBX-001": {
    "checks": [
      {
        "id": "default-unchecked",
        "description": "Omitting status and defaultStatus exposes checked=false.",
        "source": "SPEC.md#props-and-defaults",
        "evidence": "unit",
        "tests": [{ "kind": "unit", "fullName": "Checkbox renders default checkbox accessibility and secondary styling" }]
      }
    ],
    "remaining": "Additional checks and evidence remain necessary."
  }
}
```

This abbreviated example shows one row, not the complete requirement. Define the checklist from the SPEC and its
companions before inspecting test coverage; do not define requirements by the tests that happen to exist.
Every SPEC requirement must have its complete acceptance-check set, including checks with no tests. Never shrink or
filter that set based on available tests or execution results. Completeness requires reviewing all applicable contract
clauses; merely listing every requirement ID is not a completeness proof. `source` cites the contract file/section from which the check
was derived. `evidence` declares whether the claim needs unit, native, type, or visual verification.
`tests: []` keeps an uncovered check visible; it means no approved test link, not necessarily no existing test.
The legacy schema-v2 path has no type or visual adapters, so those checks remain uncovered there; the full-inventory
path above has separate compiler and authenticated reviewed-observation adapters.

Unit links identify exact Jest full names in the configured runtime files. Native links identify the exact configured
story/callback. Multiple tests can be linked to one check, and one test can appear under multiple checks. A shared
check ID can appear under several requirements only with an identical definition. Every linked test must qualify
before a check passes. A skipped, missing, stale, unverified or failed test cannot qualify a row.
Execution-case counts deduplicate shared test links; they are not inflated by repeated rows.
`unit.excludedCases` records reviewed tests that receive no target requirement credit and why.

The pilot prepares this matrix from its reviewed premade mapping before assessing saved evidence. Automatic proposal
generation and owner review remain future mapping-maintenance work. Generated Markdown contains the readable
requirement/check/test matrix with evidence outcomes; generated assessment JSON contains the same rows.
A passing row establishes only that mapped check, not complete parent coverage, native behavior from JS, or maturity.

## Existing evidence and explicit local execution

```powershell
yarn workspace @fluentui-react-native/components assess-components --component checkbox --evidence "C:\furn\apps\storybook\artifacts\desktop\<run-id>\run.json"
yarn workspace @fluentui-react-native/components assess-components --component checkbox --unit-evidence "C:\evidence\jest.json"
yarn workspace @fluentui-react-native/components assess-components --component checkbox --run-unit-tests --max-age-hours 24
```

Evidence and output arguments are relative to the command's working directory; use absolute paths when selecting a
workspace from another directory. Canonical native input is the `desktop-test` supervisor `run.json` with its declared
Storybook companion retained in the same run directory. Historical direct native and smoke reports are accepted for
replay, but absent provenance remains unverified.

Default execution reads reports only. Omitting reports produces an honest missing-evidence inventory.
`--run-unit-tests` is an explicit local option that uses the package's declared test script, selected runtime files,
and Jest JSON output. It does not substitute type-test Jest results for a compiler check. It cannot be combined with
replayed unit inputs. Each execution gets a fresh UUID-named directory.

`--context`, `--build-id`, `--target-id`, and a positive `--max-age-hours` are needed to qualify bound native evidence.
Unit replay uses its original `--unit-context`, `--unit-build-id`, and explicit age policy. Context must be created
during execution, not reconstructed later from current files. It binds exact result bytes, source commit, dirty state,
contract/mapping fingerprints, platform, execution interval, and build identity. Native target identity is captured
before execution. A dirty checkout or missing binding keeps observations unverified; native and unit bindings remain separate.

`--output` chooses an artifact directory. A single control writes `assessment.json`, `assessment.md`, and an exact
`assessment.mapping.json` copy there. The copy contains the reviewed matrix, without execution results.
Batch local assessment uses separate package/control subdirectories. These outputs are ignored by default.
`--update-spec` additionally writes a clearly marked local report and the managed assessment fields in the adjacent
SPEC; it is never a bound CI publication. Input/output aliases, linked SPEC destinations, and concurrent SPEC changes
are rejected.

## Evidence rules

Choose evidence that proves the claim; a requirement does not inherently need both a unit and a native test.

| Claim                                                                    | Appropriate evidence                                      |
| ------------------------------------------------------------------------ | --------------------------------------------------------- |
| Defaults, state ownership/transitions, callbacks, resolved styles        | Complete code-level assertions can suffice.               |
| Public TypeScript constraints                                            | A compiler/type-check result, not a Jest types-file pass. |
| Rendered wrapping, layout, focus-ring geometry                           | Layout or visual execution.                               |
| Actual platform accessibility actions, focus, keyboard or physical input | Native execution for the integration claim.               |

Preserve failures, skips, missing cases, unconfigured controls, retries, flaky execution, stale mappings, and mismatched
inputs. Enclosing execution failures prevent recorded passes from qualifying. Unmapped test results remain visible
but receive no requirement credit. Multi-assertion failures do not identify which individual assertion is defective.

The native adapter currently supports Win32/Paper Storybook, and the unit adapter parses Jest JSON. Type/build,
visual/manual ingestion and other native targets are not implemented. Shared configuration does not qualify those targets.

## CI flow and outputs

The PR workflow captures inputs before the existing JS package tests and Win32 smoke run. The package Jest invocation
is called exactly once with its existing selection, arguments, platform, and exit status; capture adds JSON output.
One package execution can supply separately bound evidence for multiple configured controls. Other packages and
platform invocations are unchanged.

Assessment is advisory, including its capture infrastructure. The PR workflow sets `FURN_ASSESSMENT_ADVISORY=true`:
capture preparation or finalization errors are logged as unavailable evidence, while the original Jest or native
command still runs exactly once and keeps its real exit status. Evidence-only preparation, collection, extra compiler
capture, and uploads cannot fail ordinary source jobs. Actual builds, tests, and smoke commands are not marked
`continue-on-error`. Outside advisory mode, explicit capture commands retain strict error behavior.

JS and native jobs remain parallel. The later **Assess component evidence** job downloads same-attempt artifacts,
installs the tools needed for Lage, and runs the same package command with `FURN_ASSESSMENT_CI=true`. That mode combines
saved evidence only: local replay flags, test execution, and tracked-file writes are prohibited. It still runs after
ordinary source-job failures, but not after cancellation or successfully verified report-only reuse.
Failed input inspection or reuse verification triggers full source CI rather than skipping it. The required **PR**
check depends only on source validation; assessment infrastructure failures remain visible in advisory jobs and logs,
and missing or rejected evidence remains unavailable, never a passing readiness claim.

Source artifacts are `component-unit-evidence-<attempt>` and `component-native-evidence-<attempt>`.
Final output is `component-assessments-<attempt>`, retained for 14 days. Inside it, each configured control has
`<package-path>/<component>/bundle.json`, `assessment.json`, `ASSESSMENT.md`, `assessment.mapping.json`, proposed `SPEC.md`,
and any original unit JSON/context. The mapping is the exact reviewed source used for that execution, not a reconstruction
from passing test names.
The same readable report appears in the job summary. Files are created under ignored
`apps/storybook/artifacts/win32/assessment-ci/`, not committed by the assessment job.

Each bundle binds repository, PR, source head/base, actual tested merge commit, complete tracked input digest,
workflow run, attempt, and execution times. A native capture accepts exactly one fresh desktop run and verifies its
ID and target; it does not select by modification time. Missing/cached outputs stay missing. A failed source validation
cannot become a successful PR through assessment. Hosted `keyboard`, `physicalClick`, and `wheel` remain disabled.

## Formatting and exact report verification

Generated Markdown follows `oxfmt`, including the checked-in report path; there is no assessment-specific exclusion.
Generation, publication, and report-only verification use the same formatter and repository configuration, then compare
the complete expected output exactly. Formatting does not weaken rejection of altered findings, metadata, or SPEC content.
Formatter errors are failures, not permission to accept an unformatted report.

Normal jobs use repository dependencies. Trusted validation/publication jobs install only the pinned formatter in a
temporary tools directory with lifecycle scripts disabled. They do not install PR dependencies or execute PR code.
Keep that pin aligned with the repository lockfile when upgrading the formatter.

## Optional same-PR publication

Publication remains disabled unless a maintainer separately enables it. The default-branch workflow reconstructs
reports from original evidence with trusted code. It never checks out or executes the PR with write credentials.
Publication validates all configured controls together and writes their generated reports, SPEC fields, and reviewed
mapping snapshots in one atomic commit. Report-only reuse requires the complete configured set from the same tested workflow attempt.

The only allowed writes are that control's generated `assessment/ASSESSMENT.md`, the strict, canonical
`assessment-*` front-matter block in its SPEC, and the exact tested `assessment.mapping.json`.
The publisher independently reads the mapping from the tested Git tree and rejects an altered or missing artifact copy.
In this premade pilot the source mapping already has those bytes, so publishing it normally creates no mapping diff.
It never invents checks, refreshes reviewed fingerprints, or silently changes test links.
Human-authored contract bytes and lifecycle remain unchanged.
The block records package version, source/tested identity, dirty state, Win32/Paper target, outcome, health, provenance,
generation time, report pointer, and an undetermined stage. Only matched clean native evidence supplies the native-tested SHA.
The later report commit is not relabeled as the tested commit.

The tracked-input digest excludes configured generated summary paths and removes only validated SPEC assessment
blocks; modes and all other source, contract, mapping, dependency, workflow and configuration bytes remain inputs.
Reuse requires an immediate report commit changing exactly the report and SPEC per control, the unchanged reviewed mapping,
unchanged merge-tree inputs, the matching original artifact,
exact reconstructed report/SPEC, and the original **PR source validation** result. The explicit reuse limit is 168 hours.
Old, expired, or unverifiable evidence falls back to full source CI; it never creates current coverage.
Any future mapping proposal that changes checks, links, or fingerprints remains a source-input change and must undergo
review and normal CI, not report-only reuse.

Activation requires trusted tooling on the default branch, a repository-scoped GitHub App with only Contents write,
`CONTROL_ASSESSMENT_APP_CLIENT_ID`, secret `CONTROL_ASSESSMENT_APP_PRIVATE_KEY`, and
`CONTROL_ASSESSMENT_PUBLISH=true`. A maintainer must verify organization policy and validate the full hosted flow first.
No token or key belongs in source, reports, or logs. Forks and non-default-target PRs retain artifacts without branch writes.

Publication never blocks the required **PR** check, even for eligible opt-in runs.
API failures, changed heads, ambiguous evidence, and invalid generated fields are not successful publication.
The commit API's expected-head check prevents races; there is no force push, merge, approval, or protection bypass.
Disable the opt-in to return to artifact-only operation. Resolve real merge conflicts before regenerating
reports; do not merge assessment prose as if it were current execution evidence.
