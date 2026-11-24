import { renderMessageBar_unstable } from './renderMessageBar';
import type { MessageBarProps } from './message-bar.types';
import { useMessageBar_unstable } from './useMessageBar';
import { useMessageBarStyles_unstable } from './useMessageBarStyles';

export function MessageBar(props: MessageBarProps) {
  const state = useMessageBar_unstable(props);
  useMessageBarStyles_unstable(state);
  return renderMessageBar_unstable(state);
}
MessageBar.displayName = 'MessageBar';
