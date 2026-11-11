# Proposal: portable semantics and native action conformance

[Guide](../../platform-divergence.md) | [Component evidence](component-layering.md)

**Hypothetical API research.** Shared role names and event handlers are insufficient if the native tree, provider
pattern or action dispatch disagrees. A declaration's presence is not proof of implementation.

## Options and contract

Extend core's existing semantic props with missing collection metadata and relationships, or introduce a versioned
semantic descriptor. Prefer established vocabulary where applicable, but document native meanings rather than
copying a DOM model wholesale. Core already declares `role="option"` in the inspected baseline; the problem is
not simply adding that word.

This should generalize existing implementation seams, not invent parallel vocabulary: core Android already
handles `accessibilityCollection`/`accessibilityCollectionItem` and maps expand/collapse natively, although those
collection props and action names are absent from the inspected 0.81.6 typed contract.
See [Android view properties](https://github.com/facebook/react-native/blob/v0.81.6/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/uimanager/ViewProps.kt)
and [action mapping](https://github.com/facebook/react-native/blob/v0.81.6/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/uimanager/ReactAccessibilityDelegate.java).
The portable contract should type and generalize position, size, level and collection structure. Relationships
should extend existing labelled-by support. RNW's role-projection gap for option/listbox illustrates why shared
vocabulary alone is insufficient.

Canonical standard actions could standardize existing lowercase names, including RNW toggle/select and
expand/collapse, with add/remove selection and backend aliases where needed.
Preserve arbitrary custom action names verbatim. Standard action support, collection projection and
relationships should have separate capability declarations. A backend must not expose an actionable native
pattern while silently dropping its callback.

Potential relationships include controls, described-by and active-descendant using live, root-scoped identities.
Define target lifetime, missing targets and cross-root limits. Real option focus is an alternative component
design, not an automatic fallback for unsupported active-descendant transport.

Core owns the vocabulary, declaration-to-projection-to-invocation contract, and conformance fixtures.
Platforms map to AX, UIA, Android accessibility or other native systems. Components own role selection, labels,
controlled state and whether a refused state change leaves the native tree unchanged.

## Portability and failure

Desktop collection controls, mobile external-keyboard navigation, TV and alternative accessible renderers can use
the same semantic intent while advertising different optional relationships. Never pretend that `AXPress`, an
arbitrary custom AX action, UIA ExpandCollapse and a synthetic JS click are interchangeable.
Unsupported semantics must be distinguishable from unavailable targets or an application refusing a state change.
Avoid putting semantic state into a display-value string merely to make a snapshot look correct.

## Validation in core

1. Type/codegen and prop-parsing fixtures cover canonical names, platform alias boundaries and custom-name
   preservation. Unit tests cover declaration deduplication and exactly-once routing.
2. Core iOS/Android native fixtures compare initial, updated and reset projections for roles, labels, states,
   collection metadata and relations. Dead or cross-root references need explicit expected results.
3. Invoke the native action provider and assert one callback plus the resulting native state. Include controlled
   refusal and disabled-but-focusable items. JS `fireEvent`, action listing or tree snapshots alone cannot pass.
4. Out-of-tree backends run equivalent UIA/AX cases. Narrator/VoiceOver speech and navigation are separate human
   or platform-qualified gates; snapshots do not establish the spoken experience.

Dropdown ExpandCollapse and option PositionInSet provide candidate negative fixtures from the source-inferred
questions in the component article. Keep those questions open until native execution resolves them.

Evidence: [action transport observations](../../../agents/accessibility/action-transport-evidence.md),
[action normalization](../../../../packages/framework-base/src/accessibility/resolveAccessibilityAction.ts),
[RNmacOS patch boundary](../../../../packages/agentic/native-core/references/rnmacos-patch.md),
[core accessibility types](https://github.com/facebook/react-native/blob/v0.81.6/packages/react-native/Libraries/Components/View/ViewAccessibility.js).
