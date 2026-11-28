/** @jsxImportSource @fluentui-react-native/framework-base */
import { directComponent } from '@fluentui-react-native/framework-base';
import { CheckmarkCircle12Regular } from '../../common/generated/fluent-icons/CheckmarkCircle12Regular.generated';
import { CheckmarkCircle16Regular } from '../../common/generated/fluent-icons/CheckmarkCircle16Regular.generated';
import { DiamondDismiss12Regular } from '../../common/generated/fluent-icons/DiamondDismiss12Regular.generated';
import { DiamondDismiss16Regular } from '../../common/generated/fluent-icons/DiamondDismiss16Regular.generated';
import { Warning12Regular } from '../../common/generated/fluent-icons/Warning12Regular.generated';
import { Warning16Regular } from '../../common/generated/fluent-icons/Warning16Regular.generated';
import type { IconElementProps, SvgIconSource } from '../../primitives/icon/icon.types';

function adapt(Asset: typeof Warning16Regular): () => SvgIconSource {
  const Mark = directComponent(({ color, ...props }: IconElementProps) => <Asset {...props} primaryFill={color} pointerEvents="none" />);
  return () => Mark;
}

export const fieldAssets = {
  CheckmarkCircle12Regular: adapt(CheckmarkCircle12Regular),
  CheckmarkCircle16Regular: adapt(CheckmarkCircle16Regular),
  DiamondDismiss12Regular: adapt(DiamondDismiss12Regular),
  DiamondDismiss16Regular: adapt(DiamondDismiss16Regular),
  Warning12Regular: adapt(Warning12Regular),
  Warning16Regular: adapt(Warning16Regular),
};

export function parseFieldAsset(value: unknown): SvgIconSource {
  if (typeof value !== 'function') throw new TypeError('Expected an SVG validation mark');
  return value as SvgIconSource;
}
