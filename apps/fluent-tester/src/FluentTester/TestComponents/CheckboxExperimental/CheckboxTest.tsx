import * as React from 'react';
import { EXPERIMENTAL_CHECKBOX_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Checkbox } from '@fluentui-react-native/experimental-checkbox';
import { useTheme } from '@fluentui-react-native/theme-types';
import { View, TextInput, TextStyle } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { E2ECheckboxExperimentalTest } from './E2ECheckboxExperimentalTest';

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
  const onChangeControlled1 = React.useCallback((checked) => {
    setCheckedControlled1(checked);
  }, []);

  const [isCheckedControlled2, setCheckedControlled2] = React.useState(true);
  const onChangeControlled2 = React.useCallback((checked) => {
    setCheckedControlled2(checked);
  }, []);

  return (
    <View>
      <Checkbox label="This is a controlled Checkbox" onChange={onChangeControlled1} checked={Boolean(isCheckedControlled1)} />
      <Checkbox
        label="Checkbox rendered with boxSide 'end' (controlled)"
        onChange={onChangeControlled2}
        boxSide="end"
        checked={Boolean(isCheckedControlled2)}
      />
    </View>
  );
};

const tokenCheckbox: React.FunctionComponent = () => {
  const CircularCheckbox = Checkbox.customize({ borderRadius: 50 });

  const CircleColorCheckbox = Checkbox.customize({
    borderRadius: 50,
    checkboxBackgroundColor: 'white',
    checked: {
      checkboxBackgroundColor: 'green',
      checkboxBorderColor: 'green',
      checkmarkColor: 'white',
    },
    focused: { checkboxBackgroundColor: 'menuItemBackgroundHovered' },
    hovered: { checkboxBackgroundColor: 'menuItemBackgroundHovered' },
    pressed: { checkboxBackgroundColor: 'menuItemBackgroundPressed' },
  });

  const HoverCheckbox = Checkbox.customize({
    checked: {
      checkboxBackgroundColor: 'black',
      checkmarkColor: 'white',
    },
    hovered: {
      checkmarkOpacity: 1,
    },
  });

  const [checkboxColor, setCheckboxColor] = React.useState('blue');
  const [checkmarkColor, setCheckmarkColor] = React.useState('white');

  const BlueCheckbox = Checkbox.customize({
    checkboxBackgroundColor: 'white',
    checked: {
      checkboxBackgroundColor: checkboxColor,
      checkboxBorderColor: checkboxColor,
      checkmarkColor: checkmarkColor,
    },
    focused: { checkboxBackgroundColor: 'menuItemBackgroundHovered' },
    hovered: { checkboxBackgroundColor: 'menuItemBackgroundHovered' },
    pressed: { checkboxBackgroundColor: 'menuItemBackgroundPressed' },
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
        onSubmitEditing={(e) => {
          setCheckboxColor(e.nativeEvent.text);
        }}
      />

      <TextInput
        style={[commonStyles.textBox, textBoxBorderStyle]}
        placeholder="Checkmark color"
        blurOnSubmit={true}
        onSubmitEditing={(e) => {
          setCheckmarkColor(e.nativeEvent.text);
        }}
      />
    </View>
  );
};

const checkboxSections: TestSection[] = [
  {
    name: 'Basic Checkboxes',
    testID: EXPERIMENTAL_CHECKBOX_TESTPAGE,
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
  {
    name: 'E2E Testing for Experimental Checkbox',
    component: E2ECheckboxExperimentalTest,
  },
];

export const ExperimentalCheckboxTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'N/A',
    macosStatus: 'Experimental',
    androidStatus: 'N/A',
  };

  const description =
    'Checkboxes give people a way to select one or more items from a group, or switch between two mutually exclusive options (checked or unchecked, on or off).';

  return <Test name="Experimental Checkbox Test" description={description} sections={checkboxSections} status={status} />;
};
