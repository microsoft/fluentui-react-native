# Accordion interaction

The header uses React Native press handling. Pointer, touch, `Enter`, and `Space` activation request the opposite expanded value. In uncontrolled mode, that request updates internal state; in controlled mode, it only calls `onExpandedChange`, and the caller must provide the next `expanded` value. Press handling retains the consumer's native handlers through the pressable state hook.

Hover and pressed header feedback are resolved from pressable state, with pressed taking precedence. Focus is owned by the header; the body and its children manage their own focus once visible. The component does not implement sibling navigation, roving focus, or focus transfer after expansion.

The focus target follows the [shared focus visual policy](../../AGENTS.md#focus-visual-policy).
Windows/macOS default to the native ring, with no custom subtree. Win32 defaults
to a private `FocusRing` slot. Its configured ring Views remain mounted on the
custom path, but are visible only while focused with keyboard modality from
`useRootSettings`. Programmatic focus follows the last root modality; pointer
focus stays hidden unless the composition hook uses `alwaysVisible`. That
override selects the custom path and still requires focus. Disabled or
noninteractive targets show no custom ring. The visual is decorative and cannot
intercept input; native ring appearance remains renderer-owned.

The chevron rotates immediately and the body visibility styles change immediately. There is no component-owned motion or reduced-motion branch.

## Focus target lifetime

The state hook uses the shared ref-backed focus foundation. Internal focus-target
refs compose with caller refs on the actual interactive slot, without redirecting
structural root refs. Native self-focus is distinct from descendant events, and
detach/disable invalidates pending focus requests. Focus visuals observe root
modality only while focused on the custom path; there is no scene-wide rerender.
