import type { ColorValue } from 'react-native';
import { Svg } from 'react-native-svg';
import type { NumberProp, SvgProps } from 'react-native-svg';

/** Props accepted by every generated Fluent icon component. */
export type FluentIconsProps<TBaseAttributes extends SvgProps = SvgProps> = TBaseAttributes & {
  /** Glyph fill. Defaults to the `color` prop, and to the SVG default of black when there is none. */
  primaryFill?: ColorValue;
  /** Accessibility label, used when `accessibilityLabel` is not supplied. */
  title?: string;
};

export type FluentSvgProps = FluentIconsProps<SvgProps> & {
  /** Optical size of a sized glyph. It defaults the width, height, and viewBox; omit it for a resizable glyph. */
  size?: NumberProp;
};

/**
 * Root element of the generated Fluent icon components. A sized glyph draws in a viewBox of its own size, a resizable glyph
 * in a 20 by 20 viewBox shown at 24 by 24, and explicit `width`, `height`, or `viewBox` props always win.
 *
 * Unlike the upstream icon components, this adds no `aria-hidden` or `role` default. Accessibility follows the React Native
 * props the Icon primitive passes through.
 *
 * `react-native-svg` applies `width` and `height` only when both are non-zero and truncates fractional values to whole
 * points, so give a glyph whole-number dimensions.
 */
export function FluentSvg(props: FluentSvgProps) {
  const { accessibilityLabel, primaryFill, size, title, ...rest } = props;
  // `currentColor` follows the `color` prop; without one there is nothing for it to resolve to, so leave the fill unset.
  const fill = primaryFill ?? (rest.color == null ? undefined : 'currentColor');
  return (
    <Svg
      {...rest}
      accessibilityLabel={accessibilityLabel ?? title}
      fill={fill}
      height={rest.height ?? size ?? 24}
      viewBox={rest.viewBox ?? `0 0 ${size ?? 20} ${size ?? 20}`}
      width={rest.width ?? size ?? 24}
    />
  );
}
