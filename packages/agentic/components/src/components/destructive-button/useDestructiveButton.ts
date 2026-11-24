import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { useButton_unstable } from '../button/useButton';
import type { DestructiveButtonProps, DestructiveButtonState } from './destructive-button.types';

export function useDestructiveButton_unstable({
  content,
  accessibilityLabel,
  appearance: appearanceProp,
  ...props
}: DestructiveButtonProps): DestructiveButtonState {
  const appearance = appearanceProp === 'primary' ? 'primary' : 'subtle';
  const visibleContent = content?.trim() ? content : undefined;
  const name = accessibilityLabel?.trim() ? accessibilityLabel : undefined;
  const button = useButton_unstable({
    ...props,
    content: visibleContent === undefined ? undefined : { ...hiddenFromAccessibilityProps, children: visibleContent },
    accessibilityLabel: name,
    appearance,
  });
  return { ...button, appearance, hasCommand: visibleContent !== undefined || (name !== undefined && props.leadingIcon !== undefined) };
}
