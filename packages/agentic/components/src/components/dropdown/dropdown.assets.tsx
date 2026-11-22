/** @jsxImportSource @fluentui-react-native/framework-base */
import { directComponent } from '@fluentui-react-native/framework-base';

import { ChevronDown16Regular } from '../../common/generated/fluent-icons/ChevronDown16Regular.generated';
import { ChevronDown20Regular } from '../../common/generated/fluent-icons/ChevronDown20Regular.generated';
import { ChevronDown24Regular } from '../../common/generated/fluent-icons/ChevronDown24Regular.generated';
import { ChevronUp16Regular } from '../../common/generated/fluent-icons/ChevronUp16Regular.generated';
import { ChevronUp20Regular } from '../../common/generated/fluent-icons/ChevronUp20Regular.generated';
import { ChevronUp24Regular } from '../../common/generated/fluent-icons/ChevronUp24Regular.generated';
import type { IconElementProps, SvgIconSource } from '../../primitives/icon/icon.types';

const Down16 = directComponent(({ color, ...props }: IconElementProps) => (
  <ChevronDown16Regular {...props} pointerEvents="none" primaryFill={color} />
));
const Down20 = directComponent(({ color, ...props }: IconElementProps) => (
  <ChevronDown20Regular {...props} pointerEvents="none" primaryFill={color} />
));
const Down24 = directComponent(({ color, ...props }: IconElementProps) => (
  <ChevronDown24Regular {...props} pointerEvents="none" primaryFill={color} />
));
const Up16 = directComponent(({ color, ...props }: IconElementProps) => (
  <ChevronUp16Regular {...props} pointerEvents="none" primaryFill={color} />
));
const Up20 = directComponent(({ color, ...props }: IconElementProps) => (
  <ChevronUp20Regular {...props} pointerEvents="none" primaryFill={color} />
));
const Up24 = directComponent(({ color, ...props }: IconElementProps) => (
  <ChevronUp24Regular {...props} pointerEvents="none" primaryFill={color} />
));

export const dropdownChevronAssets = {
  ChevronDown16Regular: () => Down16,
  ChevronDown20Regular: () => Down20,
  ChevronDown24Regular: () => Down24,
  ChevronUp16Regular: () => Up16,
  ChevronUp20Regular: () => Up20,
  ChevronUp24Regular: () => Up24,
};

export function parseDropdownChevron(value: unknown): { svgSource: SvgIconSource } {
  if (typeof value !== 'function') throw new TypeError('Expected an SVG chevron source');
  return { svgSource: value as SvgIconSource };
}
