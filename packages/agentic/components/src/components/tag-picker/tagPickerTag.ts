import { useLayoutEffect } from 'react';
import { renderTag_unstable } from '../tag/renderTag';
import { useTag_unstable } from '../tag/useTag';
import { useTagStyles_unstable } from '../tag/useTagStyles';
import type { TagPickerOption, TagPickerState } from './tag-picker.types';

export function TagPickerTag({ option, picker }: { option: TagPickerOption; picker: TagPickerState }) {
  const { value, label } = option;
  const { register, getProps } = picker.tagFocus;
  const removeLabel = picker.formatRemoveLabel(option);
  const tag = useTag_unstable({
    ...getProps(value),
    content: label,
    accessibilityLabel: removeLabel,
    size: picker.size === 'small' ? 'small' : 'medium',
    disabled: picker.visualState === 'disabled' || option.disabled,
    dismiss: !!removeLabel.trim(),
    onDismiss: removeLabel.trim() ? () => picker.remove(value) : undefined,
  });
  useLayoutEffect(() => register(value, tag.focusTarget), [value, register, tag.focusTarget]);
  useTagStyles_unstable(tag);
  return renderTag_unstable(tag);
}
