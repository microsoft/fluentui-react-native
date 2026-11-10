import type { ComponentPropsTransform } from '@fluentui-react-native/framework-base';

import type { Icon } from '../primitives/icon/icon';
import type { SvgIconSource } from '../primitives/icon/icon.types';
import {
  CheckboxChecked16Filled,
  CheckboxChecked20Filled,
  CheckboxChecked24Filled,
  CheckboxUnchecked16Regular,
  CheckboxUnchecked20Regular,
  CheckboxUnchecked24Regular,
  Checkmark12Filled,
  Checkmark16Filled,
  Checkmark20Filled,
  Checkmark24Filled,
  CheckmarkCircle16Filled,
  ChevronDown16Regular,
  ChevronDown20Regular,
  ChevronDown24Regular,
  ChevronRight16Regular,
  ChevronRight20Regular,
  ChevronUp16Regular,
  ChevronUp20Regular,
  ChevronUp24Regular,
  Circle12Filled,
  Circle16Filled,
  Circle20Filled,
  Circle20Regular,
  Dismiss12Regular,
  Dismiss16Regular,
  ErrorCircle16Filled,
  Person12Regular,
  Person16Regular,
  Person20Regular,
  Person24Regular,
  Person32Regular,
  Person48Regular,
  RadioButton16Filled,
  RadioButton16Regular,
  RadioButton20Filled,
  RadioButton20Regular,
  RadioButton24Filled,
  RadioButton24Regular,
  Subtract12Filled,
  Subtract16Filled,
  Subtract20Filled,
  Subtract24Filled,
} from './icons/fluentIcons.generated';
import { createSizedIconSource } from './icons/sizedIconSource';

/**
 * Fluent icons the components draw by default. Sized entries pick the optical size nearest to the width and height the
 * component gives the icon. Add the glyphs to `scripts/icons/icon-manifest.mts` and run `yarn gen:icons` before using a new one.
 */
export const semanticIconSources = {
  checkboxChecked: createSizedIconSource(
    { 16: CheckboxChecked16Filled, 20: CheckboxChecked20Filled, 24: CheckboxChecked24Filled },
    'CheckboxChecked',
  ),
  checkboxUnchecked: createSizedIconSource(
    { 16: CheckboxUnchecked16Regular, 20: CheckboxUnchecked20Regular, 24: CheckboxUnchecked24Regular },
    'CheckboxUnchecked',
  ),
  checkmark: createSizedIconSource(
    { 12: Checkmark12Filled, 16: Checkmark16Filled, 20: Checkmark20Filled, 24: Checkmark24Filled },
    'Checkmark',
  ),
  chevron: createSizedIconSource({ 16: ChevronRight16Regular, 20: ChevronRight20Regular }, 'ChevronRight'),
  chevronDown: createSizedIconSource({ 16: ChevronDown16Regular, 20: ChevronDown20Regular, 24: ChevronDown24Regular }, 'ChevronDown'),
  chevronUp: createSizedIconSource({ 16: ChevronUp16Regular, 20: ChevronUp20Regular, 24: ChevronUp24Regular }, 'ChevronUp'),
  dismiss: createSizedIconSource({ 12: Dismiss12Regular, 16: Dismiss16Regular }, 'Dismiss'),
  error: ErrorCircle16Filled,
  indeterminate: createSizedIconSource(
    { 12: Subtract12Filled, 16: Subtract16Filled, 20: Subtract20Filled, 24: Subtract24Filled },
    'Subtract',
  ),
  person: createSizedIconSource(
    { 12: Person12Regular, 16: Person16Regular, 20: Person20Regular, 24: Person24Regular, 32: Person32Regular, 48: Person48Regular },
    'Person',
  ),
  radioSelected: createSizedIconSource({ 16: RadioButton16Filled, 20: RadioButton20Filled, 24: RadioButton24Filled }, 'RadioButtonFilled'),
  radioUnselected: createSizedIconSource(
    { 16: RadioButton16Regular, 20: RadioButton20Regular, 24: RadioButton24Regular },
    'RadioButtonRegular',
  ),
  selectedCircle: createSizedIconSource({ 12: Circle12Filled, 16: Circle16Filled, 20: Circle20Filled }, 'CircleFilled'),
  success: CheckmarkCircle16Filled,
  unselectedCircle: Circle20Regular,
} as const satisfies Record<string, SvgIconSource>;

/**
 * Creates an Icon slot transform that supplies `source` as the icon unless the caller already chose a font, image, or SVG
 * source. A `svgSource` default prop would instead hide a caller's `fontSource` or `imageSource`, because Icon draws
 * `svgSource` first. Create the transform once at module level so the slot is not updated on every render.
 */
export function withDefaultIconSource(source: SvgIconSource): ComponentPropsTransform<typeof Icon> {
  return (props) => {
    const { fontSource, imageSource, svgSource, ...rest } = props;
    return fontSource || imageSource || svgSource ? props : { ...rest, svgSource: source };
  };
}
