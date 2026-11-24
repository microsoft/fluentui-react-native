import { renderTagPicker_unstable } from './renderTagPicker';
import type { TagPickerProps } from './tag-picker.types';
import { useTagPicker_unstable } from './useTagPicker';
import { useTagPickerStyles_unstable } from './useTagPickerStyles';

export const TagPicker = (props: TagPickerProps) => {
  const state = useTagPicker_unstable(props);
  useTagPickerStyles_unstable(state);
  return renderTagPicker_unstable(state);
};
TagPicker.displayName = 'TagPicker';
