import { Checkbox } from '@fluentui/react-native';
import { useTheme } from '@fluentui-react-native/theme-types';
import * as React from 'react';
import { View, TextInput, TextStyle } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { CHECKBOX_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

function onChangeUncontrolled(isChecked: boolean) {
  console.log(isChecked);
}

const basicCheckbox: React.FunctionComponent = () => {
  return (
    <View>
      <Checkbox label="Unchecked checkbox (undefined)" onChange={onChangeUncontrolled} />
      <Checkbox label="Unchecked checkbox (uncontrolled)" onChange={onChangeUncontrolled} defaultChecked={false} />
      <Checkbox
        label="Checked checkbox (uncontrolled)"
        onChange={onChangeUncontrolled}
        defaultChecked={true}
        accessibilityLabel="Hello there"
      />
      <Checkbox label="Disabled checkbox" onChange={onChangeUncontrolled} defaultChecked={false} disabled={true} />
      <Checkbox label="Disabled checked checkbox" onChange={onChangeUncontrolled} defaultChecked={true} disabled={true} />
      <Checkbox label="Checkbox will display a tooltip" onChange={onChangeUncontrolled} tooltip="This is a tooltip" />
    </View>
  );
};

const otherCheckbox: React.FunctionComponent = () => {
  const [isCheckedControlled1, setCheckedControlled1] = React.useState(false);
  const onChangeControlled1 = React.useCallback(checked => {
    setCheckedControlled1(checked);
  }, []);

  const [isCheckedControlled2, setCheckedControlled2] = React.useState(true);
  const onChangeControlled2 = React.useCallback(checked => {
    setCheckedControlled2(checked);
  }, []);

  return (
    <View>
      <Checkbox label="This is a controlled Checkbox" onChange={onChangeControlled1} checked={isCheckedControlled1} />
      <Checkbox
        label="Checkbox rendered with boxSide 'end' (controlled)"
        onChange={onChangeControlled2}
        boxSide="end"
        checked={isCheckedControlled2}
      />
    </View>
  );
};

const tokenCheckbox: React.FunctionComponent = () => {
  const CircularCheckbox = Checkbox.customize({ tokens: { borderRadius: 50 } });

  const CircleColorCheckbox = Checkbox.customize({
    tokens: { borderRadius: 50, checkboxBackgroundColor: 'white' },
    _overrides: {
      checked: {
        tokens: {
          checkboxBackgroundColor: 'green',
          checkboxBorderColor: 'green',
          checkmarkColor: 'white',
        },
      },
      focused: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
      hovered: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
      pressed: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundPressed' } },
    },
  });

  const HoverCheckbox = Checkbox.customize({
    _overrides: {
      checked: {
        tokens: {
          checkboxBackgroundColor: 'black',
          checkmarkColor: 'white',
        },
      },
      hovered: {
        tokens: {
          checkmarkVisibility: 1,
        },
      },
    },
  });

  const [checkboxColor, setCheckboxColor] = React.useState('blue');
  const [checkmarkColor, setCheckmarkColor] = React.useState('white');

  const BlueCheckbox = Checkbox.customize({
    tokens: { checkboxBackgroundColor: 'white' },
    _overrides: {
      checked: {
        tokens: {
          checkboxBackgroundColor: checkboxColor,
          checkboxBorderColor: checkboxColor,
          checkmarkColor: checkmarkColor,
        },
      },
      focused: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
      hovered: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundHovered' } },
      pressed: { tokens: { checkboxBackgroundColor: 'menuItemBackgroundPressed' } },
    },
  });

  const theme = useTheme();
  const textBoxBorderStyle: TextStyle = {
    borderColor: theme.colors.inputBorder,
  };
  return (
    <View>
      <CircularCheckbox label="A circular checkbox" onChange={onChangeUncontrolled} defaultChecked={false} />
      <HoverCheckbox label="A checkbox with checkmark visible on hover" onChange={onChangeUncontrolled} defaultChecked={false} />
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

const checkboxSections: TestSection[] = [
  {
    name: 'Basic Checkboxes',
    testID: CHECKBOX_TESTPAGE,
    component: basicCheckbox,
  },
  {
    name: 'Other Implementations',
    component: otherCheckbox,
  },
  {
    name: 'Token Customized Checkboxes',
    component: tokenCheckbox,
  },
];

export const CheckboxTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'N/A',
    macosStatus: 'Experimental',
    androidStatus: 'N/A',
  };

  const description =
    'Checkboxes give people a way to select one or more items from a group, or switch between two mutually exclusive options (checked or unchecked, on or off).';

  return <Test name="Checkbox Test" description={description} sections={checkboxSections} status={status} />;
};
