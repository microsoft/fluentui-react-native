# Shared accessibility foundation

Put universal, non-styling accessibility helpers in this directory. Keep
component roles, state ownership, accessible-name policy, and activation
callbacks in the owning component. Styling belongs in Design; native focus
targets and keyboard coordination remain in the existing focus hooks.

Extract only demonstrated shared behavior. Do not build a generic action
registry, role framework, or speculative list of platform constants.

## Semantic actions

Use `resolveAccessibilityAction('toggle' | 'select', Platform.OS, callerActions)`
and use both results from the same resolution:

```ts
const action = resolveAccessibilityAction('toggle', Platform.OS, accessibilityActions);
// Assign action.accessibilityActions to the native root.
// Compare event.nativeEvent.actionName === action.name in its handler.
```

The resolver is pure and declares actions; it does not invoke a native service
or guarantee that a platform's default assistive gesture invokes that action.
Components may memoize the resolution against their caller action array.
Constants alone are insufficient: declarations and event comparisons must
agree, and duplicate declarations can produce duplicate native callbacks.

The current transport contract is:

| Platform        | Toggle   | Select   | Evidence and limits                                                                                                                                                                                                                         |
| --------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows Fabric  | `toggle` | `select` | RNW 0.81.35 `CompositionDynamicAutomationProvider.cpp` dispatches lowercase names. `UiaHelpers.cpp::DispatchAccessibilityAction` compares case-sensitively and emits once for every matching declaration.                                   |
| Office Win32    | `Toggle` | `Select` | `@office-iss/react-native-win32` 0.81.8 `ViewAccessibility.d.ts` declares these UIA action names; existing FURN V1 Checkbox and Switch use `Toggle`. Native UIA invocation still needs target-platform verification.                        |
| macOS           | `Toggle` | `Select` | RNmacOS 0.81.9 Fabric `RCTViewComponentView.mm::accessibilityCustomActions` exposes the declared names verbatim; `didActivateAccessibilityCustomAction` emits that exact name. These are custom actions, not an inferred `AXPress` mapping. |
| Other platforms | `Toggle` | `Select` | Retains existing custom declarations; this is not native pattern or gesture qualification. Verify a renderer before claiming support.                                                                                                       |

These source paths are relative to the installed platform package:

- RNW: `Microsoft.ReactNative/Fabric/Composition/`.
- Win32: `Libraries/Components/View/ViewAccessibility.d.ts`.
- RNmacOS Fabric: `React/Fabric/Mounting/ComponentViews/View/RCTViewComponentView.mm`.
- RNmacOS Paper: `React/Views/RCTView.m`.

RNmacOS Fabric constructs custom actions from `name`, ignoring `label`; keep
caller labels in JS rather than replacing them with guessed localized text.
Paper instead maps a custom action's label back to its declared name and
implements `accessibilityPerformPress` using `activate` or `onAccessibilityTap`.
Fabric's `accessibilityActivate` only forwards `onAccessibilityTap`, and is not
that AppKit press implementation. Do not map toggle/select to `activate`,
synthesize `onPress`, or add an AXPress fallback based on Paper evidence.

The resolver normalizes only the owned semantic action's two known spellings.
It deduplicates exact resulting names, preserves caller order and the first
defined label (including an empty label), and prepends a missing owned action.
Other custom names retain their case and identity; inputs are not mutated.
An already normalized, duplicate-free array is returned unchanged. Incoming
events are not rewritten or matched case-insensitively.

## Future authoring requirements

- Read the component contract and source-check the installed renderer's action
  declaration, event name, invocation, and default activation paths. Record
  versions and separate observed behavior from inference.
- Keep the generic package entrypoint React-only import-safe. Use type-only
  native imports and explicit platform inputs for pure utilities, or an
  opt-in native implementation with an explicit unsupported generic facade.
  Never eagerly import `Platform` or a native module through the generic index.
  Preserve Framework Base's React 18 compatibility.
- Keep disabled guards and controlled/uncontrolled or group state ownership in
  components. Compose the component behavior first, then forward the original
  caller event exactly once, including custom and disabled actions. Do not
  synthesize a pointer/keyboard event from an accessibility event.
- Cover declaration casing, duplicate names, caller labels/actions, exact event
  matching, callback counts/order, and disabled state in unit tests. Add type
  coverage for public helpers and run the React-only import path.
- Native qualification must invoke UIA `TogglePattern.Toggle` or
  `SelectionItemPattern.Select`, or the actual AX custom action, and assert
  native state plus callback counts. State read after a physical click, a Jest
  `fireEvent`, or a successful bundle is not native action-dispatch evidence.
  Report unsupported native actions and unrun platforms explicitly.
