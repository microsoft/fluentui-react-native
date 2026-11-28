/** @jsxImportSource @fluentui-react-native/framework-base */
import { directComponent } from '@fluentui-react-native/framework-base';
import { Search20Regular } from '../../common/generated/fluent-icons/Search20Regular.generated';
import type { IconElementProps, SvgIconSource } from '../../primitives/icon/icon.types';

const SearchIcon = directComponent(({ color, ...props }: IconElementProps) => (
  <Search20Regular {...props} primaryFill={color} pointerEvents="none" />
));

export const searchBoxAssets = { Search20Regular: () => SearchIcon };

export function parseSearchIcon(value: unknown): SvgIconSource {
  if (typeof value !== 'function') throw new TypeError('Expected an SVG search glyph');
  return value as SvgIconSource;
}
