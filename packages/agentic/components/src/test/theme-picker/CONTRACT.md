# ThemePicker contract

`ThemePicker` is a controlled selection surface composed from the existing
agentic Dropdown and ListboxItem components.

- **TPK-001:** `selection` is the displayed value and `onSelectionChange`
  reports a valid user choice. The picker never owns state or optimistically
  changes its displayed value.
- **TPK-002:** The source selector has inherited, Flex default and Fluent
  default values. Explicit source choices carry a structured
  `ThemeAppearanceRequest`; inherited mode carries no appearance override.
- **TPK-003:** Explicit source selections expose System, Light and Dark color
  schemes plus System, Standard and High Contrast. Changing one appearance
  field preserves every other requested field. Inherited mode does not silently
  override its parent's appearance.
- **TPK-004:** Selection uses Dropdown's `selectedOptions` and
  `onSelectedOptionsChange` contract and direct ListboxItem options with
  unique string values. Invalid, missing or empty option reports are ignored.
- **TPK-005:** Every Dropdown has an explicit accessible name, a stable
  caller-derived automation ID and a constrained root style. Dropdown owns
  popup presence, keyboard navigation, focus return and dismissal.
- **TPK-006:** The picker adds no theme provider, storage, Storybook dependency
  or native popup implementation. It can render under a caller's ThemedRoot.
- **TPK-007:** Flex appearance requests do not imply distinct stock dark or
  high-contrast token values. Fluent selections use existing appearance-aware
  defaults.
