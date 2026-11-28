/** @jsxImportSource @fluentui-react-native/framework-base */
import { directComponent } from '@fluentui-react-native/framework-base';
import { Star12Filled } from '../../common/generated/fluent-icons/Star12Filled.generated';
import { Star12Regular } from '../../common/generated/fluent-icons/Star12Regular.generated';
import { Star16Filled } from '../../common/generated/fluent-icons/Star16Filled.generated';
import { Star16Regular } from '../../common/generated/fluent-icons/Star16Regular.generated';
import { Star20Filled } from '../../common/generated/fluent-icons/Star20Filled.generated';
import { Star20Regular } from '../../common/generated/fluent-icons/Star20Regular.generated';
import type { IconElementProps, SvgIconSource } from '../../primitives/icon/icon.types';

function starAsset(Star: typeof Star16Regular): () => SvgIconSource {
  const icon = directComponent(({ color, ...props }: IconElementProps) => <Star {...props} pointerEvents="none" primaryFill={color} />);
  return () => icon;
}

export const starAssets = {
  Star12Filled: starAsset(Star12Filled),
  Star12Regular: starAsset(Star12Regular),
  Star16Filled: starAsset(Star16Filled),
  Star16Regular: starAsset(Star16Regular),
  Star20Filled: starAsset(Star20Filled),
  Star20Regular: starAsset(Star20Regular),
};

export function parseStarSource(value: unknown): SvgIconSource {
  if (typeof value !== 'function') throw new TypeError('Expected an SVG star source');
  return value as SvgIconSource;
}
