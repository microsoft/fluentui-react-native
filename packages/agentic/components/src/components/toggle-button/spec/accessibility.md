# ToggleButton accessibility

The root is the only focus and action target. Use its visible scalar label as the default name or respect an explicit
name or naming reference. Icon-only and rich content need a meaningful name; do not change the name when selection
changes. Icons and the private text used to reserve width are decorative. Preserve unrelated caller state and
custom actions, but the component owns its button role, disabled state and checked value in both directions.

Use the [shared accessibility resolver](../../../../../../framework-base/references/accessibility.md) to declare
and match Toggle on the same renderer. Preserve caller action labels; do not equate discovery of an action with
successful invocation. Require a working name, state, and focus treatment in light, dark and high contrast.

| Endpoint                      | Required evidence before Button migration                                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Windows Fabric / Office Win32 | Invoke UIA Toggle; verify checked off/on, one callback, stable name, and disabled suppression. Qualify Narrator separately from UIA properties.                                                                                                        |
| macOS Fabric / Paper          | Check AX name/role, actual custom-action availability and invocation, and VoiceOver state announcement separately on each renderer. A listed action or ordinary AX press is not a successful Toggle; record unsupported checked projection explicitly. |

Pointer and keyboard input require independent native evidence. Story or JavaScript assertions alone do not prove
any of the above.
