---
id: components.assessments
kind: instruction-reference
owner_paths:
  - packages/agentic/components
---

# Advisory component assessment

Assessment explains what existing test results establish against reviewed requirements, and what remains unproven.
It is not a new test framework, release gate, or automatic maturity decision. A successful command means that reports
were generated, not that a control is ready. Lifecycle metadata and Backlog/Experimental/Beta/Production decisions
are not changed.

The shared implementation lives in `@fluentui-react-native/scripts/src/ci/assessment/`; its workflow entrypoint is
`@fluentui-react-native/scripts/src/ci/controlAssessmentCiTask.ts`. Normal developer commands remain in
`@fluentui-react-native/scripts/src/tasks/assessControlTask.ts`. This package owns its control definitions and guidance.
See [Checkbox](checkbox.md) for the pilot's reviewed coverage and [remaining work](../remaining-work.md) for deferred work.

## Package command and discovery

From the repository root:

```powershell
yarn lage assess-components
```

Lage invokes each package that declares `assess-components`. This package delegates to `fluentui-scripts assess-components`.
The task is deliberately uncached: execution evidence, freshness, and the current workflow attempt must be checked each time.
Assessment is not part of `buildci`, because its final CI execution must wait for the existing native and JS jobs.

To list this package's configured and unconfigured controls without assessing them:

```powershell
yarn workspace @fluentui-react-native/components assess-components --list
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
Type and visual adapters are not implemented, so those checks remain uncovered.

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

JS and native jobs remain parallel. The later **Assess component evidence** job downloads same-attempt artifacts,
installs the tools needed for Lage, and runs the same package command with `FURN_ASSESSMENT_CI=true`. That mode combines
saved evidence only: local replay flags, test execution, and tracked-file writes are prohibited. It still runs after
ordinary source-job failures, but not after cancellation or invalid input validation.

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
Old or expired evidence falls back to full CI or fails verification; it never creates current coverage.
Any future mapping proposal that changes checks, links, or fingerprints remains a source-input change and must undergo
review and normal CI, not report-only reuse.

Activation requires trusted tooling on the default branch, a repository-scoped GitHub App with only Contents write,
`CONTROL_ASSESSMENT_APP_CLIENT_ID`, secret `CONTROL_ASSESSMENT_APP_PRIVATE_KEY`, and
`CONTROL_ASSESSMENT_PUBLISH=true`. A maintainer must verify organization policy and validate the full hosted flow first.
No token or key belongs in source, reports, or logs. Forks and non-default-target PRs retain artifacts without branch writes.

For eligible opt-in runs, the required **PR** check waits for publication and exact report-only verification.
API failures, changed heads, ambiguous evidence, and invalid generated fields are not successful publication.
The commit API's expected-head check prevents races; there is no force push, merge, approval, or protection bypass.
Disable the opt-in and rerun CI to return to artifact-only operation. Resolve real merge conflicts before regenerating
reports; do not merge assessment prose as if it were current execution evidence.
