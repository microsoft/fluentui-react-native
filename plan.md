# Control readiness assessor: Checkbox pilot

## Purpose and scope

Make the evidence behind a control's readiness review visible and repeatable.
Start with the **agentic Checkbox on Win32/Paper**, using tests FURN already
runs. This is an advisory assessor, not a new test framework, release gate,
or automatic maturity promotion.

The longer-term goal is an agent that evaluates changed controls against their
reviewed contracts, reports gaps, and supports human decisions about lifecycle
stages such as Backlog, Experimental, Beta, and Production. The pilot deliberately
does not assign those stages: the evidence requirements and promotion policy
still need agreement.

## Design

```text
Reviewed Checkbox SPEC + requirement metadata + reviewed assertion mappings
                              |
Existing JS PR Jest results --+-- Existing Win32 Storybook native results
                              |
                  Validate execution provenance
                              |
                Assess each mapped requirement
                              |
              JSON + Markdown + proposed SPEC snapshot
                              |
       Optional trusted publisher -> same PR -> human review
```

1. **Use the contract as the inventory.** Read CBX-001 through CBX-006 from
   `packages/agentic/components/src/components/checkbox/SPEC.md` and its
   `spec/source.json`. A filename listed as evidence is not an executed test.
2. **Use reviewed mappings, not guessed coverage.** Map exact test identities to
   the particular assertions they establish. Fingerprints detect changes to the
   contract, test sources, and relevant harness inputs. Drift requires review;
   the pilot does not automatically rewrite its mappings.
3. **Reuse existing execution.** Capture JSON and context from the component
   package's existing Jest invocation in **JS PR**, without changing its test
   selection or running Checkbox again. Independently collect the canonical
   `desktop-test` report and Storybook companion from **Win32 Storybook PR**.
   The subsequent **Assess Checkbox evidence** job combines results; it runs no
   tests and does not serialize the JS and native workloads.
4. **Bind evidence to what actually ran.** Validate source/build identity,
   report hashes, target, execution intervals, dirty state, and mapping
   fingerprints. Preserve failures, skips, missing execution, retries, flaky
   results, and stale or mismatched evidence rather than turning them into a
   pass. Other controls' results are not Checkbox coverage.
5. **Publish an advisory explanation.** Emit machine-readable JSON and readable
   Markdown with requirement-level observations, gaps, and provenance. Upload
   attempt-specific artifacts and write a job summary. An opt-in publisher can
   later commit the generated Markdown and managed SPEC assessment fields
   atomically to the same PR; it does not change the human-authored contract.

Implementation details, commands, schemas, and setup:
[scripts/CONTROL-ASSESSMENT.md](scripts/CONTROL-ASSESSMENT.md).

## What the initial mappings establish

| Requirement                  | Appropriate evidence                                                                           | Initial pilot scope                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| CBX-001: defaults and API    | Runtime unit assertions and compiler/type assertions                                           | Selected existing unit assertions; compiler-result ingestion is not implemented.                     |
| CBX-002: state and callbacks | Unit assertions for ownership/transitions; native execution for integration claims             | Selected existing units plus partial binary-toggle native coverage when physical input is available. |
| CBX-003: anatomy and text    | Unit assertions for structure/props; native layout for rendered geometry                       | Selected existing units; no blanket claim about rendered wrapping.                                   |
| CBX-004: accessibility       | Unit assertions for resolved semantics; native assertions for actual platform exposure/actions | Selected existing units plus the existing native callback's checkbox-role assertion.                 |
| CBX-005: styling and tokens  | Unit assertions for resolved styles; visual evidence for visual claims                         | Selected existing units; no visual qualification.                                                    |
| CBX-006: Win32 focus         | Native keyboard/focus and geometry evidence                                                    | No mapped executed evidence in the initial slice.                                                    |

A requirement does **not** inherently need both unit and native tests. Choose
the evidence layer that proves the claim. Jest's macOS mock and simulated
`Platform.OS` values do not prove native Win32 behavior. The normal compiler
already includes Checkbox type assertions, but the pilot does not yet ingest
that build result.

The initial mapping intentionally remains bounded to 42 previously reviewed
runtime cases and the existing default-story callback,
`toggles native checked state in both directions`. Subsequent Checkbox tests
already on `main` remain existing tests; unmapped results are not silently
credited as requirement coverage. Expanding those mappings is a follow-up.
This PR adds tooling tests, not new Checkbox behavior tests.

## Pilot rollout and acceptance

1. **Review this draft.** Agree on the architecture, partial mappings, report
   vocabulary, and CI impact before enabling any automated branch writes.
2. **Validate collection in CI.** Confirm the ordinary Jest invocation executes
   once, reports retain package-wide failures, and the assessor combines only
   matching source/run/attempt evidence. Exercise missing and skipped evidence
   as well as successful execution.
3. **Review the Checkbox report.** Confirm each credited assertion is supported
   and missing claims remain explicit. Hosted Win32 Storybook CI disables
   `keyboard`, `physicalClick`, and `wheel`; the mapped physical-toggle test
   therefore remains skipped there. A green CI job is not physical-input
   qualification or full Checkbox readiness.
4. **Enable optional same-PR publication separately.** After trusted tooling is
   on the default branch, a maintainer may configure the narrowly scoped GitHub
   App and opt-in variable described in the usage guide. The publisher executes
   trusted default-branch code, treats PR artifacts as data, and permits only
   the generated Checkbox summary and managed SPEC block. Verified report-only
   follow-ups may reuse unchanged source validation; ordinary changes still run
   normal checks. Fork PRs do not receive automated branch writes.
5. **Expand only after the pilot is useful.** Review mappings for the remaining
   existing Checkbox tests, ingest existing compiler results, define readiness
   policy with owners, then introduce another control/platform through explicit
   adapters rather than generalizing from Checkbox automatically.

Acceptance means honest, reproducible evidence reporting with preserved source
validation, not a Production rating. No hosted publisher activation, physical
input enablement, repository-rule changes, or additional control rollout is
part of submitting this draft. No historical local assessment is checked in as
current CI evidence.

## Automatically update the SPEC and report in the same PR

This is **optional maintainer-enabled publication**, separate from generating
CI artifacts and a job summary. The setup enables later eligible CI runs to
publish; configuring it does not itself write an assessment.

1. **Merge the reviewed pilot into `main` with publication disabled.** The
   trusted validator and `workflow_run` publisher must be on the default branch
   before the complete publication flow can operate.
2. **Install a dedicated GitHub App on this repository only.** Grant
   **Contents: write**; no workflow-write, administration, review-approval, or
   protection-bypass permission is needed.
3. **Configure the App credentials in repository Actions settings.** Add
   repository variable `CONTROL_ASSESSMENT_APP_CLIENT_ID` and repository secret
   `CONTROL_ASSESSMENT_APP_PRIVATE_KEY`. Never put the private key in source,
   reports, or logs.
4. **Verify organization policies and permitted branch writes.** A maintainer
   must confirm the Actions and App policies allow this workflow without
   weakening repository protections.
5. **Enable and trial publication.** Set repository variable
   `CONTROL_ASSESSMENT_PUBLISH=true`, then run CI on a same-repository pilot PR
   targeting `main`. Verify the generated commit and the subsequent trusted
   report-only validation before considering the flow enabled successfully.

After an eligible source PR workflow completes, trusted code reconstructs the
assessment from the matching evidence and atomically commits both files to the
same PR branch:

- The managed `assessment-*` **YAML front-matter block** in Checkbox's `SPEC.md`.
  It records the source/package identity, tested commit when supported by
  matched clean native evidence, target, outcome, health, provenance,
  generation time, and report link. The stage remains `not-determined`.
- The linked `checkbox/assessment/ASSESSMENT.md` generated report.

The publisher does not edit the human-authored requirements, contract approval,
or lifecycle status. The report commit is not itself labelled as the tested
source. Fork PRs retain artifacts but receive no automated branch write.
The existing required **PR** check waits for verified publication when this
opt-in applies; failed source validation cannot become green through a report
commit. A misconfigured publisher therefore blocks eligible PRs rather than
silently claiming success.

For rollback, disable `CONTROL_ASSESSMENT_PUBLISH` and rerun the PR workflow if
needed to restore the ordinary artifact-only path. No physical-input enablement
or branch-protection bypass is required. The exact field schema, trust checks,
and setup details remain in
[the implementation guide](scripts/CONTROL-ASSESSMENT.md#maintainer-activation-and-first-hosted-trial).
