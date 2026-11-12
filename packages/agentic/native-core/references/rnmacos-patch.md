---
id: native-core.rnmacos-patch
kind: instruction-reference
owner_paths:
  - packages/agentic/native-core
  - .yarn/patches
---

# Repository-local RNmacOS patch

The root resolution pins RNmacOS 0.81.9 with
`.yarn/patches/react-native-macos-npm-0.81.9-aa583a0648.patch`. It reuses Paper's
native AX role converter for Fabric, projects disabled/selected/expanded state
onto the actual accessible element, removes the structural Fabric TextInput's
extra Tab stop, and separates read-only single-line editing from disabled state
on both renderers. Read-only editors remain selectable/focusable; disabled editors
remain disabled. It also maps their `textbox` role through the existing converter.
Fabric paragraphs (`<Text>`) set `accessible` now expose themselves as static
text on macOS. RNmacOS otherwise rejects them unconditionally because its iOS
element provider is compiled out, which hides every Text label and `testID`
from accessibility clients.

## Native-props synchronization backport

The root also applies
`.yarn/patches/react-native-macos-npm-0.81.9-native-props.patch`, a minimal
backport of MIT-licensed React Native code from
[upstream commit `923e7ddcaf4d` by OrfeasZ, #52646](https://github.com/facebook/react-native/commit/923e7ddcaf4d2de45ca7dedafbb84c6b87dbffc4).
The upstream copyright and license in the patched source files remain intact.
Fabric's window-resize layout can clone animated nodes on the main thread while
JavaScript replaces their `nativeProps_DEPRECATED` map. This concurrent-access
cause is inferred from the failing reader, the unguarded source, and the upstream
fix; no ThreadSanitizer run established the concurrent writer. The backport guards
both writers and the cloning reader with one family-owned mutex, copying the
props before releasing the lock and parsing them afterward. This preserves
merge precedence without holding the mutex across shadow-tree commits.
Regenerate Pods and clean-build all native dependencies after changing this
patch: the family header's layout changes.

The race was exposed while qualifying F16 defect 1's oversized-preview repair
for physical-click obstruction. Both complete Fabric lanes lost the app in
the unchanged PGB-006 NativeSemantics window-resize callback. A clean native
rebuild still failed, and an owned-process AddressSanitizer report recorded
`BUS` in `folly::dynamic::type()` while `ShadowNode::clone` copied the
unprotected native-props map during AppKit layout. This is a renderer
concurrency fix, not a click-through or driver retry workaround. PGB-006 runs
in the full Fabric physical lane as well as the accessible lane; the original
Checkbox, keyboard-clear, and Accordion reproductions passed without this
backport.

## Native-props regression ledger (2026-11-12 UTC)

The following before/after runs include E's separately owned driver and LiteUI
fixes. They isolate the renderer prerequisite but do not claim those fixes are
present in the standalone backport branch.

- Before the backport, Fabric full physical run
  `7bfe3fc7-bcbc-4275-ac5b-b457b66af7d7` and accessible run
  `aebe42da-fcf5-4482-8eec-3e28401ea50c` failed PGB-006. Clean native
  rebuild run `5314fc3d-da45-403e-b9bd-e187f0a9284c` still failed.
  The owned-process report is
  `artifacts/desktop/f16-macos-physical/fabric-progress-asan-report.86816`.
- After the backport, fresh Pods and a clean Fabric native build retained
  AddressSanitizer and passed the same forced-resize callback **1/1**, run
  `61d2dce4-5980-49b9-a727-412da47fca71`. Native Core's Apple module and
  Office-style bridging-header probe passed **3/3**. The build, callback,
  sanitizer linkage, and probe log is
  `artifacts/desktop/f16-macos-physical/native-props-clean-build-green.log`.
- Both complete Fabric lanes then passed without retries or changed assertions:
  physical **343 passed, 3 declared unsupported**, run
  `3cb2f6af-69fd-44c1-8fb0-495607e37ca0`; accessible **260 passed,
  3 declared unsupported**, run `e8ef9d6a-e3a0-4164-b692-de319aaae545`.
  Neither lane had failed, skipped, quarantined, incomplete, retried, or flaky
  cases. The report is
  `artifacts/desktop/f16-macos-physical/fabric-native-props-final-lanes-qualification.json`.
- This native build evidence is for macOS Storybook. The macOS FluentTester
  host and any other native application consuming the root resolution were
  **not built** in this local check; the Apple probe is not an Office host
  application build.

### Standalone bottom-layer verification

Branch `user/jasonvmo/rnmacos-native-props-backport` starts directly at
`origin/main` commit `505a2187b`, with the backport committed as `1eaa60a44`.
It does not contain E's driver, CI, or LiteUI implementation commits.
The following checks passed on that branch alone, in a fresh worktree:

- `yarn install --immutable`: **passed**, without changing the manifest,
  lockfile, or patches.
- `yarn build`: **passed**.
- From `apps/storybook`, `yarn storybook bundle --macos`,
  `yarn storybook prep --macos`, and `yarn storybook build --macos`:
  **passed**, with fresh Pods and DerivedData. The native build report is
  `e9329920-eb03-4104-879e-b0c73af7820d`. AddressSanitizer remained linked;
  the resulting native image SHA256 is
  `0497580af4a37e99f2f092e3f9b716caa7d2936ecd5ff740e1d1ecd42251f35a`.
- `yarn workspace @fluentui-react-native/native-core test:apple-integration`:
  **passed, 3/3** module/bridging-header checks.

The shared native lock covered this batch. The machine-local Ruby environment
pinned the already-installed `json` gem to 2.18.0; no E product-source overlay
was applied. The captured command/results log is E's
`artifacts/desktop/f16-macos-physical/native-props-bottom-verify.log`.
This standalone check builds the Fabric Storybook host; it is not a claim
that the original input reproductions pass without E's driver/runtime fixes.

## Scope and replacement

These fixes belong in RNmacOS, not in a MenuItem-specific native host or a
JavaScript accessibility-value workaround. The patch is used by this repository's
native hosts; publishing native-core or components does **not** install it in a
consumer. Its upstream replacement is a release gate tracked in
[remaining work](remaining-work.md#rnmacos-upstream-replacement).
