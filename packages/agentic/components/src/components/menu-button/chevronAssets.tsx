import { ChevronDown16Regular } from '../../common/generated/fluent-icons/ChevronDown16Regular.generated';
import { ChevronDown20Regular } from '../../common/generated/fluent-icons/ChevronDown20Regular.generated';
import type { IconElementProps, SvgIconSource } from '../../primitives/icon/icon.types';

function Chevron16({ color, ...props }: IconElementProps) {
  return <ChevronDown16Regular {...props} pointerEvents="none" primaryFill={color} />;
}

function Chevron20({ color, ...props }: IconElementProps) {
  return <ChevronDown20Regular {...props} pointerEvents="none" primaryFill={color} />;
}

export const chevronAssets = {
  ChevronDown16Regular: () => Chevron16,
  ChevronDown20Regular: () => Chevron20,
};

export function parseChevronSource(value: unknown): { svgSource: SvgIconSource } {
  if (typeof value !== 'function') throw new TypeError('Expected an SVG chevron source');
  return { svgSource: value as SvgIconSource };
}
