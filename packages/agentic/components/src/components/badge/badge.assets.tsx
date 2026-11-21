/** @jsxImportSource @fluentui-react-native/framework-base */
import { directComponent } from '@fluentui-react-native/framework-base';
import { CheckmarkCircle12Regular } from '../../common/generated/fluent-icons/CheckmarkCircle12Regular.generated';
import { CheckmarkCircle16Regular } from '../../common/generated/fluent-icons/CheckmarkCircle16Regular.generated';
import { DiamondDismiss12Regular } from '../../common/generated/fluent-icons/DiamondDismiss12Regular.generated';
import { DiamondDismiss16Regular } from '../../common/generated/fluent-icons/DiamondDismiss16Regular.generated';
import { Info12Regular } from '../../common/generated/fluent-icons/Info12Regular.generated';
import { Info16Regular } from '../../common/generated/fluent-icons/Info16Regular.generated';
import { Warning12Regular } from '../../common/generated/fluent-icons/Warning12Regular.generated';
import { Warning16Regular } from '../../common/generated/fluent-icons/Warning16Regular.generated';
import type { IconElementProps, SvgIconSource } from '../../primitives/icon/icon.types';

type FluentStatusIcon = typeof Info12Regular;

function asSource(FluentIcon: FluentStatusIcon) {
  return () =>
    directComponent(({ color, ...props }: IconElementProps) => <FluentIcon {...props} pointerEvents="none" primaryFill={color} />);
}

export const statusBadgeAssets = {
  CheckmarkCircle12Regular: asSource(CheckmarkCircle12Regular),
  CheckmarkCircle16Regular: asSource(CheckmarkCircle16Regular),
  DiamondDismiss12Regular: asSource(DiamondDismiss12Regular),
  DiamondDismiss16Regular: asSource(DiamondDismiss16Regular),
  Info12Regular: asSource(Info12Regular),
  Info16Regular: asSource(Info16Regular),
  Warning12Regular: asSource(Warning12Regular),
  Warning16Regular: asSource(Warning16Regular),
};

export function parseStatusBadgeSource(value: unknown): SvgIconSource {
  if (typeof value !== 'function') throw new TypeError('Expected an SVG status icon source');
  return value as SvgIconSource;
}
