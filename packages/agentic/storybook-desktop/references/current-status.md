---
id: storybook-desktop.current-status
kind: instruction-reference
owner_paths:
  - packages/agentic/storybook-desktop
---

# Native qualification status

## Windows Fabric and Win32 Paper — #4441 connected-session qualification — 2026-11-12 UTC

**Observed baseline:** `505a2187b0a2451aed7081c9260b343d55742f93`,
Windows 11 Enterprise build 26300 x64, Node 26.13.0. Packaged Windows
Fabric reused native build `bdeb0b291` after comparison found only
native-core metadata/version differences; **Inferred:** reuse was valid.
Win32 Paper used REX 0.81.1. Own-checkout Metro, manifests and protected
bundles served both endpoints. Native/GUI runs were serialized in the W3
campaign with `-RequirePhysical`; before/after gates stayed eligible,
unlocked **remote RDP**, not console. One 1728 x 1084 origin-zero monitor
at 96 DPI / 100% was attached; settings were not changed.

### Win32 fresh-preview fencing

**Passed, Observed:** after a verified Checkbox selection, an injected
stimulus called the real orchestrator's bridge-retirement path while
deliberately preserving the socket and native preview. Old preview ref
`hkbo1` at epoch `(1,1)` rejected mutation with `ref-region-changed`.
A newly found, unique **native** checkbox ref `hkbo3` at epoch `(1,2)`
then rejected mutation with `story-context-stale`. Both were effect-none,
not quarantined; the checkbox remained unchecked. Pre-established chrome
ref `hkbo2` survived, and old/fresh chrome presence checks passed.

This closes the earlier bounded fresh-preview-fence gap for **injected
provider-context loss**. It does not claim a native crash, actual socket
disconnect/reconnect, transparent upstream reconnection, chrome mutation,
or quarantine recovery.

Exact local qualification invocation, inside the machine-wide
`with-native-lock.ps1 -Lane W3 -RequirePhysical` scope:

```powershell
node .\artifacts\desktop\w3-qualification\run-endpoint.mjs win32 --fence-only
```

Qualification ID `60751352-c158-40a2-b4f9-9251e15fec95`, driver run
`64d2de39-df69-4a2b-a164-fc842f0ef64e`, session
`08419564-7f43-48d2-9e08-b0f971590a95`. Artifacts relative to the tested
qualification checkout:
`artifacts\desktop\w3-qualification\runs\60751352-c158-40a2-b4f9-9251e15fec95\descriptor-cases-win32-fence.json`
and `qualification.json` in the same directory. The harness explicitly read
current-story state before injecting loss. These retained local scripts
are not a new published Storybook CLI or supported fault-injection API.

### Secondary-window observations and open fixes

| Case                                        | Observed outcome                                                                                                                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fabric separately registered modern Callout | Passed: exact distinct opaque handle, switch, complete 11-node observation, unique `modern-callout-focus`, actual physical-pointer click, `focus: confirmed`, then popup removal |
| Fabric secondary semantic activation        | Failed: exact same control returned applied/accessibility, but main status stayed `Idle` over six checks / 2090 ms and final native observation                                  |
| Paper separately registered Callout         | Not run / partial: legacy popup shown, but only main registered; modern Callout absent from actual catalog                                                                       |
| 200%                                        | Not run: current scale 100%; changing it unauthorized                                                                                                                            |
| Mixed DPI                                   | Not run: one attached monitor                                                                                                                                                    |
| Negative-origin layout                      | Not run: origin-zero monitor only; no approved eligible layout                                                                                                                   |
| Physical console Ctrl+C                     | Not run: separate implementation lane owns it                                                                                                                                    |

The Fabric status assertion read main through its explicit native root
without switching foreground; physical click passed once / 79 ms.
**Inferred:** accessibility-pattern/renderer dispatch may acknowledge an
activation without reaching Pressable `onPress`; the selected pattern was
not instrumented. Paper native inventory **observed** a visible untitled
root `Net UI Tool Window`, ToolWindow true. **Inferred:** the driver's
untitled `WS_EX_TOOLWINDOW` filter prevents its registration. These two
gaps are being fixed on this branch; this entry does not qualify the fixes.

Exact bounded follow-ups, under the same physical-gated campaign wrapper:

```powershell
node .\artifacts\desktop\w3-qualification\run-endpoint.mjs windows --secondary-only --modern-only
node .\artifacts\desktop\w3-qualification\run-endpoint.mjs windows --secondary-only --modern-only --physical-secondary
```

Semantic failure: qualification `675160f7-e069-413c-a6c8-486de0c37b69`,
driver `a9f2e71e-71ab-40f0-a375-fd6d76a0b971`; report
`artifacts\desktop\w3-qualification\runs\675160f7-e069-413c-a6c8-486de0c37b69\descriptor-cases-windows-secondary---modern.json`.
Physical pass: qualification `7fbe3b0b-df33-476b-80e3-95b97bf19f02`,
driver `16aac92b-bb36-4742-bd29-01df381d9594`; same artifact-root layout,
`descriptor-cases-windows-secondary---modern---physical.json`.
Paper inventory: qualification `22332065-6fa3-4061-a2b6-93f83295ca2e`,
`descriptor-cases-win32-secondary.json`.

The supervisor ran supported driver/bundle/run stages in order, bundling
before launch and using actual readiness identity. Earlier setup,
unsupported-story, invalid-selector/fact and receipt-only failures remain
retained, not silently counted as passes. Session/child grants drained,
the exact owned apps/services stopped, and the W3 campaign ended.
Pre/post-end audits passed:
`FURN-AUDIT: no FURN desktop processes found`.
The complete native clear/capture/MCP matrix is in
`@fluentui-react-native/desktop-test/references/current-status.md`;
MCP response costs and default-observe completeness are in
`@fluentui-react-native/desktop-driver-mcp/references/current-status.md`.
