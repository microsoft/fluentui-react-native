import * as React from 'react';
import { View, TextInput } from 'react-native';
import { Checkbox } from '@fluentui/react-native';
import { TextWin32 } from '@office-iss/react-native-win32';
import { Separator } from '@fluentui/react-native';
import { commonTestStyles as commonStyles } from './Common/styles';
import { useTheme } from '@uifabricshared/theming-react-native';

const CircularCheckbox = Checkbox.customize({ tokens: { borderRadius: 50 } });

const CircleColorCheckbox = Checkbox.customize({
  tokens: { borderRadius: 50, checkboxBackgroundColor: 'white' },
  _overrides: {
    checked: {
      tokens: {
        checkboxBackgroundColor: 'green',
        checkboxBorderColor: 'green',
        checkmarkColor: 'white'
      }
    },
    focused: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
    hovered: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
    pressed: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundPressed' } }
  }
});

function onChangeUncontrolled(isChecked: boolean) {
  console.log(isChecked);
}

export const CheckboxTest: React.FunctionComponent<{}> = () => {
  const [checkboxColor, setCheckboxColor] = React.useState('blue');
  const [checkmarkColor, setCheckmarkColor] = React.useState('white');

  const BlueCheckbox = Checkbox.customize({
    tokens: { checkboxBackgroundColor: 'white' },
    _overrides: {
      checked: {
        tokens: {
          checkboxBackgroundColor: checkboxColor,
          checkboxBorderColor: checkboxColor,
          checkmarkColor: checkmarkColor
        }
      },
      focused: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
      hovered: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
      pressed: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundPressed' } }
    }
  });

  const [isCheckedControlled1, setCheckedControlled1] = React.useState(false);
  const onChangeControlled1 = React.useCallback(checked => {
    setCheckedControlled1(checked);
  }, []);

  const [isCheckedControlled2, setCheckedControlled2] = React.useState(true);
  const onChangeControlled2 = React.useCallback(checked => {
    setCheckedControlled2(checked);
  }, []);

  const theme = useTheme();
  const textBoxBorderStyle = {
    borderColor: theme.colors.inputBorder
  };

  return (
    <View>
      <TextWin32 style={commonStyles.section}>Basic Checkboxes</TextWin32>
      <Separator />
      <Checkbox label="Unchecked checkbox (uncontrolled)" onChange={onChangeUncontrolled} defaultChecked={false} />
      <Checkbox label="Checked checkbox (uncontrolled)" onChange={onChangeUncontrolled} defaultChecked={true} ariaLabel="Hello there" />
      <Checkbox label="Disabled checkbox" onChange={onChangeUncontrolled} defaultChecked={false} disabled={true} />
      <Checkbox label="Disabled checked checkbox" onChange={onChangeUncontrolled} defaultChecked={true} disabled={true} />

      <TextWin32 style={commonStyles.section}>Other Implementations</TextWin32>
      <Separator />
      <Checkbox label="This is a controlled Checkbox" onChange={onChangeControlled1} checked={isCheckedControlled1} />
      <Checkbox
        label="Checkbox rendered with boxSide 'end' (controlled)"
        onChange={onChangeControlled2}
        boxSide="end"
        checked={isCheckedControlled2}
      />

      <TextWin32 style={commonStyles.section}>Token Customized Checkboxes</TextWin32>
      <Separator />
      <CircularCheckbox label="A circular checkbox" onChange={onChangeUncontrolled} defaultChecked={false} />
      <CircleColorCheckbox label="A circular token-customized checkbox" onChange={onChangeUncontrolled} defaultChecked={true} />
      <BlueCheckbox
        label="Token-customized checkbox. Customizable below."
        onChange={onChangeUncontrolled}
        boxSide="end"
        defaultChecked={false}
      />

      <TextInput
        style={[commonStyles.textBox, textBoxBorderStyle]}
        placeholder="Background color"
        blurOnSubmit={true}
        onSubmitEditing={e => {
          setCheckboxColor(e.nativeEvent.text);
        }}
      />

      <TextInput
        style={[commonStyles.textBox, textBoxBorderStyle]}
        placeholder="Checkmark color"
        blurOnSubmit={true}
        onSubmitEditing={e => {
          setCheckmarkColor(e.nativeEvent.text);
        }}
      />
    </View>
  );
};
