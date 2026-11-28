/** @jsxImportSource @fluentui-react-native/framework-base */
import type { SwatchPickerState } from './swatch-picker.types';
import { SwatchPickerChoice } from './swatchPickerChoice';

export function renderSwatchPicker_unstable({ root: Root, items, focus, selectedValue, size, shape, measure, select }: SwatchPickerState) {
  return (
    <Root>
      {items.map((item, index) => (
        <SwatchPickerChoice
          key={item.value}
          item={item}
          index={index}
          count={items.length}
          focus={focus}
          selectedValue={selectedValue}
          size={size}
          shape={shape}
          measure={measure}
          select={select}
        />
      ))}
    </Root>
  );
}
