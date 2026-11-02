import type { ChannelMode } from './traits.types';
import { interactiveStatePriority } from './interactiveStatePriority';

const restStatePriority = ['disabled'] as const;

/**
 * The state priority a color channel selects. `rest` reads only the disabled state; `interactive` adds pressed and
 * hovered. Use it as the last level of the channel's color factory.
 */
export function channelStatePriority(mode: 'interactive'): typeof interactiveStatePriority;
export function channelStatePriority(mode: 'rest'): typeof restStatePriority;
export function channelStatePriority(
  mode: Extract<ChannelMode, 'rest' | 'interactive'>,
): typeof interactiveStatePriority | typeof restStatePriority {
  return mode === 'interactive' ? interactiveStatePriority : restStatePriority;
}
