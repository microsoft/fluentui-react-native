# ThemeTester contract

`ThemeTester` composes a theme picker, one `ThemedRoot`, and its children for
desktop Storybook and component-test scenes. It is composed test UI, not a
primitive or a production theme-management API.

- **THT-001:** With no selection supplied, preserve the nearest theme source
  and requested appearance. The rendered root shares the nearest scene's input
  modality and does not replace the Storybook instance or its children.
- **THT-002:** The source selection is controlled by `selection` when supplied;
  otherwise it starts in inherited mode. `defaultSelection` is used only when
  uncontrolled. `onSelectionChange` reports user changes once, but caller
  updates do not report changes or optimistically alter a controlled value.
- **THT-003:** Selecting an explicit Flex or Fluent source establishes a theme
  boundary. Source selection and requested color scheme/contrast are separate;
  changing one preserves other requested appearance fields. Returning to
  inherited mode omits source and appearance overrides.
- **THT-004:** Children and the picker are descendants of the same stable root.
  Theme changes preserve root/ref/child identity and do not key or remount
  children. The root forwards its native View ref and caller root props.
- **THT-005:** The picker is visible by default and has a stable, caller-derived
  test ID. ThemeTester owns its value and change callback; callers cannot
  override those through picker props.
- **THT-006:** The component reads theme tokens only below its owned theme
  boundary. Its layout adapts to constrained desktop width and does not assume
  a mobile portal or window dimensions.
- **THT-007:** Flex mode updates requested/resolved appearance, but this
  implementation does not promise distinct stock Flex token colors for dark
  or high-contrast requests. Fluent defaults resolve their existing
  appearance-specific palettes. No palette values are fabricated or copied.
