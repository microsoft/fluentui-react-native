---
id: components.assessments.checkbox
kind: instruction-reference
owner_paths:
  - packages/agentic/components/src/components/checkbox
---

# Checkbox assessment pilot

Checkbox is the only configured control in the pilot. The reusable assessment command, discovery, evidence capture,
and evaluation are described in [Advisory component assessment](README.md). Nothing in this pilot assigns or promotes maturity.

## Owned files

- Contract: `src/components/checkbox/SPEC.md` and its `spec/` companions.
- Reviewed machine mapping: `src/components/checkbox/assessment.mapping.json`, beside the SPEC.
- Existing runtime tests: `src/components/checkbox/checkbox.test.tsx`.
- Existing native callback: `components-checkbox--default` / `toggles native checked state in both directions`,
  including assertions in `src/common/desktopFocus.wdio.ts`.
- Generated repository report, only on explicit local opt-in or maintainer-enabled publication:
  `src/components/checkbox/assessment/ASSESSMENT.md`. Generated reports are excluded from npm package contents.

The knowledge-base guide, machine mapping, and generated report are separate files with different purposes.
The package's `furn.assessments` setting registers the mapping. Shared tooling contains no Checkbox test selection
or requirement-to-assertion policy.

## Reviewed coverage

The mapping retains the same 42 reviewed runtime assertions and one native callback from the original pilot.
Additional existing tests remain visible but unmapped until their actual assertions are reviewed.

| Requirement                  | Current mapped evidence                                                         | Remaining limits                                                     |
| ---------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| CBX-001: defaults and API    | Selected default JS props/styles                                                | Additional defaults/root props and compiler evidence                 |
| CBX-002: state and callbacks | Selected JS transitions/ownership; native binary toggle when input is available | Additional callback/precedence assertions; no full requirement claim |
| CBX-003: anatomy and text    | Selected JS text, name fallback, indicator and wrapping props                   | Additional anatomy assertions and rendered geometry                  |
| CBX-004: accessibility       | Selected JS semantics; native checkbox role                                     | Native naming/action dispatch and additional existing assertions     |
| CBX-005: styling and tokens  | Selected resolved JS tokens and variants                                        | Additional state/style assertions; no visual qualification           |
| CBX-006: Win32 focus         | No qualifying mapped execution                                                  | Focus modality, disabled/detached targets and dual-ring geometry     |

The package uses the React Native macOS Jest mock. Eight assertions simulate Win32 accessibility actions through
`Platform.OS`; they do not prove native UIA dispatch. The Windows/macOS action tables and macOS-only focus case remain
recorded without Win32 requirement credit. A unit-test pass is not native focus, rendered wrapping, or visual qualification.

Hosted CI disables physical input. The mapped native toggle therefore cannot qualify there merely because navigation
or the enclosing smoke job passed. Missing, skipped, failed or retried execution remains explicit.

## Mapping review and drift

Read the SPEC requirements and the exact assertion bodies before changing coverage. Do not infer coverage from test names,
filenames, or green CI. A mapped assertion may prove only part of a requirement, and an existing test may need a mapping
rather than a newly authored duplicate.

The contract fingerprint covers the listed contract/story files, assertion-bearing helpers, and normalized mapping
content. Only the validated generated SPEC block is removed. The unit fingerprint covers the configured runtime
tests, package/shared Jest and Babel settings, test script/mock profile, capture harness, and normalized mapping.
Line-ending normalization is intentional; changing assertion bodies or mapping scopes invalidates review.
The two reviewed fingerprint fields are excluded from mapping content to avoid self-referential hashes.

The November 4 structural change relocates the same reviewed assertion mappings into this control-owned file and
updates fingerprints for the new configuration and harness paths. It does not expand the 42-case or native callback coverage.
Future mapping/fingerprint changes still need review; never refresh a pin just to silence drift.

For an evidence-free inventory or existing-report replay:

```powershell
yarn workspace @fluentui-react-native/components assess-components --component checkbox
yarn workspace @fluentui-react-native/components assess-components --component checkbox --unit-evidence "C:\evidence\jest.json"
```

The command returns zero when advisory reports are generated. `insufficient-evidence`, null maturity values, and
unmapped cases are expected outcomes, not a readiness approval. Current validation belongs in the PR and CI results,
not historical success/failure snapshots in this guide.
