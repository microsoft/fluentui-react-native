import { ChevronDown16Regular } from '../../common/generated/fluent-icons/ChevronDown16Regular.generated';
import { ChevronDown20Regular } from '../../common/generated/fluent-icons/ChevronDown20Regular.generated';
import type { IconElementProps } from '../../primitives/icon/icon.types';
import type { fallbackChevronAssets } from './chevronAssets';

function Chevron16({ color, ...props }: IconElementProps) {
  return <ChevronDown16Regular {...props} primaryFill={color} />;
}

function Chevron20({ color, ...props }: IconElementProps) {
  return <ChevronDown20Regular {...props} primaryFill={color} />;
}

export const svgChevronAssets = {
  ChevronDown16Regular: () => ({ svgSource: Chevron16 }),
  ChevronDown20Regular: () => ({ svgSource: Chevron20 }),
} satisfies typeof fallbackChevronAssets;
