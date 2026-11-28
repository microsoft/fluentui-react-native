/** @jsxImportSource @fluentui-react-native/framework-base */
import { directComponent } from '@fluentui-react-native/framework-base';
import { PresenceAvailable16Filled } from '../../common/generated/fluent-icons/PresenceAvailable16Filled.generated';
import { PresenceAway16Filled } from '../../common/generated/fluent-icons/PresenceAway16Filled.generated';
import { PresenceBusy16Filled } from '../../common/generated/fluent-icons/PresenceBusy16Filled.generated';
import { PresenceDnd16Filled } from '../../common/generated/fluent-icons/PresenceDnd16Filled.generated';
import { PresenceOffline16Regular } from '../../common/generated/fluent-icons/PresenceOffline16Regular.generated';
import { PresenceOof16Regular } from '../../common/generated/fluent-icons/PresenceOof16Regular.generated';
import type { IconElementProps, SvgIconSource } from '../../primitives/icon/icon.types';

function adapt(Asset: typeof PresenceAvailable16Filled): () => SvgIconSource {
  const Mark = directComponent(({ color, ...props }: IconElementProps) => <Asset {...props} primaryFill={color} pointerEvents="none" />);
  return () => Mark;
}

export const presenceAssets = {
  PresenceAvailable16Filled: adapt(PresenceAvailable16Filled),
  PresenceAway16Filled: adapt(PresenceAway16Filled),
  PresenceBusy16Filled: adapt(PresenceBusy16Filled),
  PresenceDnd16Filled: adapt(PresenceDnd16Filled),
  PresenceOffline16Regular: adapt(PresenceOffline16Regular),
  PresenceOof16Regular: adapt(PresenceOof16Regular),
};

export function parsePresenceAsset(value: unknown): SvgIconSource {
  if (typeof value !== 'function') throw new TypeError('Expected an SVG presence mark');
  return value as SvgIconSource;
}
