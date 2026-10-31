import { I18nManager } from 'react-native';

import type { DirectionalHint } from '../../legacy/callout/Callout.types';
import type { CalloutProps } from './Callout.types';

/** Maps logical placement to the native directional hint, resolving start and end for the layout direction. */
export function directionalHint(placement: CalloutProps['placement']): DirectionalHint {
  const side = placement?.side ?? 'bottom';
  const align = placement?.align ?? 'start';
  const rtl = I18nManager.isRTL;
  const physical = side === 'start' ? (rtl ? 'right' : 'left') : side === 'end' ? (rtl ? 'left' : 'right') : side;
  if (physical === 'left' || physical === 'right') {
    return `${physical}${align === 'center' ? 'Center' : align === 'end' ? 'BottomEdge' : 'TopEdge'}`;
  }
  const edge = align === 'center' ? 'Center' : (align === 'start') !== rtl ? 'LeftEdge' : 'RightEdge';
  return `${physical}${edge}`;
}

export function gapSpace(placement: CalloutProps['placement']): number {
  const gap = placement?.gap ?? 0;
  if (!Number.isInteger(gap) || gap < 0) throw new RangeError('Callout gap must be a nonnegative integer in logical units.');
  return gap;
}
