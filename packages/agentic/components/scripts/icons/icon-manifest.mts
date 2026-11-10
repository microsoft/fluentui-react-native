/**
 * The Fluent icons the components render, named like the files in `@fluentui/svg-icons`: `<name>_<size>_<style>`.
 * Each icon draws with the weight of its optical size, so list every size a component renders.
 *
 * After editing, run `yarn gen:icons` in this package and commit `src/common/icons/fluentIcons.generated.tsx`.
 * New components should map their glyphs to a Fluent icon where one exists, add it here, and reach it through
 * `semanticIconSources` in `src/common/iconSources.ts`.
 */
export const iconManifest: readonly string[] = [
  // checkmark: checkbox indicator, menu item, listbox item
  'checkmark_12_filled',
  'checkmark_16_filled',
  'checkmark_20_filled',
  'checkmark_24_filled',

  // indeterminate dash: checkbox indicator
  'subtract_12_filled',
  'subtract_16_filled',
  'subtract_20_filled',
  'subtract_24_filled',

  // chevron: accordion, menu item, listbox item
  'chevron_right_16_regular',
  'chevron_right_20_regular',

  // chevron down: menu button, dropdown
  'chevron_down_16_regular',
  'chevron_down_20_regular',
  'chevron_down_24_regular',

  // chevron up: dropdown
  'chevron_up_16_regular',
  'chevron_up_20_regular',
  'chevron_up_24_regular',

  // dismiss: tag
  'dismiss_12_regular',
  'dismiss_16_regular',

  // status: progress bar
  'error_circle_16_filled',
  'checkmark_circle_16_filled',

  // person: avatar
  'person_12_regular',
  'person_16_regular',
  'person_20_regular',
  'person_24_regular',
  'person_32_regular',
  'person_48_regular',

  // selected circle: badge, accordion, menu item, listbox item
  'circle_12_filled',
  'circle_16_filled',
  'circle_20_filled',

  // unselected circle: menu item, listbox item
  'circle_20_regular',

  // radio selection indicator: list item
  'radio_button_16_regular',
  'radio_button_20_regular',
  'radio_button_24_regular',
  'radio_button_16_filled',
  'radio_button_20_filled',
  'radio_button_24_filled',

  // checkbox selection indicator: list item
  'checkbox_unchecked_16_regular',
  'checkbox_unchecked_20_regular',
  'checkbox_unchecked_24_regular',
  'checkbox_checked_16_filled',
  'checkbox_checked_20_filled',
  'checkbox_checked_24_filled',
];
