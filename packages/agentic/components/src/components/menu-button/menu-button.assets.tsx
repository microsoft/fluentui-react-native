/** @jsxImportSource @fluentui-react-native/framework-base */
import { directComponent } from '@fluentui-react-native/framework-base';

import { ChevronDown16Regular } from '../../common/generated/fluent-icons/ChevronDown16Regular.generated';
import { ChevronDown20Regular } from '../../common/generated/fluent-icons/ChevronDown20Regular.generated';
import type { IconElementProps, SvgIconSource } from '../../primitives/icon/icon.types';

const Chevron16 = directComponent(({ color, ...props }: IconElementProps) => (
  <ChevronDown16Regular {...props} pointerEvents="none" primaryFill={color} />
));

const Chevron20 = directComponent(({ color, ...props }: IconElementProps) => (
  <ChevronDown20Regular {...props} pointerEvents="none" primaryFill={color} />
));

export const chevronAssets = {
  ChevronDown16Regular: () => Chevron16,
  ChevronDown20Regular: () => Chevron20,
};

export function parseChevronSource(value: unknown): { svgSource: SvgIconSource } {
  if (typeof value !== 'function') throw new TypeError('Expected an SVG chevron source');
  return { svgSource: value as SvgIconSource };
}
