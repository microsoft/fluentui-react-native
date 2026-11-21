import { Children, Fragment, useMemo } from 'react';
import { Platform, Text } from 'react-native';
import { composeRefs } from '../../common/composeRefs';
import type { TooltipProps, TooltipState } from './tooltip.types';

function descriptionKey(platform: string) {
  switch (platform) {
    case 'macos':
      return 'accessibilityHint';
    case 'windows':
    case 'win32':
      return 'accessibilityDescription';
    default:
      throw new Error(`Tooltip is not supported on ${platform}.`);
  }
}

export function useTooltip_unstable({ children, content, ref }: TooltipProps): TooltipState {
  const trigger = Children.only(children);
  const props = trigger.props;
  const childRef = props.ref;
  const targetRef = useMemo(() => (childRef && ref && childRef !== ref ? composeRefs(childRef, ref) : (ref ?? childRef)), [childRef, ref]);

  if (trigger.type === Fragment || trigger.type === Text) {
    throw new Error('Tooltip needs a single view-backed trigger that forwards props and its ref.');
  }
  if (props.tooltip !== undefined) {
    throw new Error('Set tooltip on the trigger or use Tooltip, not both.');
  }

  const key = descriptionKey(Platform.OS);
  const tooltip = content.trim() ? content : undefined;
  const name = props['aria-label'] ?? props.accessibilityLabel;
  const describe = tooltip !== undefined && tooltip !== name && props.accessibilityHint == null && props.accessibilityDescription == null;
  return { trigger, nativeProps: { tooltip, ...(describe && { [key]: tooltip }), ...(targetRef && { ref: targetRef }) } };
}
