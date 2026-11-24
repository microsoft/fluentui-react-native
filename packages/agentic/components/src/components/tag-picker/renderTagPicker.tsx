/** @jsxImportSource @fluentui-react-native/framework-base */
import { ListboxItem } from '../listbox-item/listbox-item';
import { Platform } from 'react-native';
import type { TagPickerState } from './tag-picker.types';
import { TagPickerTag } from './tagPickerTag';

export function renderTagPicker_unstable(state: TagPickerState) {
  return (
    <state.root>
      {state.selected.length > 0 && (
        <state.tags>
          {state.selected.map((option) => (
            <TagPickerTag key={option.value} option={option} picker={state} />
          ))}
        </state.tags>
      )}
      <state.picker>
        {state.options.map((option) => (
          <ListboxItem
            key={option.value}
            value={option.value}
            content={option.label}
            disabled={option.disabled}
            testID={option.testID}
            accessibilityActions={
              Platform.OS === 'macos' && !option.disabled
                ? [
                    { name: 'AddToSelection', label: state.formatAddLabel?.(option) || option.label },
                    { name: 'RemoveFromSelection', label: state.formatRemoveLabel(option) || option.label },
                  ]
                : undefined
            }
          />
        ))}
      </state.picker>
    </state.root>
  );
}
