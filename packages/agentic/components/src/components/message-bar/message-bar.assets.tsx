/** @jsxImportSource @fluentui-react-native/framework-base */
import { directComponent } from '@fluentui-react-native/framework-base';
import { CheckmarkCircle20Regular } from '../../common/generated/fluent-icons/CheckmarkCircle20Regular.generated';
import { DiamondDismiss20Regular } from '../../common/generated/fluent-icons/DiamondDismiss20Regular.generated';
import { Info20Regular } from '../../common/generated/fluent-icons/Info20Regular.generated';
import { Warning20Regular } from '../../common/generated/fluent-icons/Warning20Regular.generated';
import type { IconElementProps, SvgIconSource } from '../../primitives/icon/icon.types';

function adapt(Asset: typeof Info20Regular): () => SvgIconSource {
  const Mark = directComponent(({ color, ...props }: IconElementProps) => <Asset {...props} primaryFill={color} pointerEvents="none" />);
  return () => Mark;
}

export const statusAssets = {
  CheckmarkCircle20Regular: adapt(CheckmarkCircle20Regular),
  DiamondDismiss20Regular: adapt(DiamondDismiss20Regular),
  Info20Regular: adapt(Info20Regular),
  Warning20Regular: adapt(Warning20Regular),
};

export function parseStatusAsset(value: unknown): SvgIconSource {
  if (typeof value !== 'function') throw new TypeError('Expected an SVG feedback status mark');
  return value as SvgIconSource;
}
