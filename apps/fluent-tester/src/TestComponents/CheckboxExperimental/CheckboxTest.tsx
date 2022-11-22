import * as React from 'react';
import { EXPERIMENTAL_CHECKBOX_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Checkbox } from '@fluentui-react-native/experimental-checkbox';
import { Theme, useTheme } from '@fluentui-react-native/theme-types';
import { View, TextInput, Platform } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { E2ECheckboxExperimentalTest } from './E2ECheckboxExperimentalTest';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { Text } from '@fluentui-react-native/text';

function onChangeUncontrolled(_e: InteractionEvent, isChecked: boolean) {
  console.log(isChecked);
}

const AndroidBasicCheckbox = () => {
  return (
    <View>
      <Checkbox label="Unchecked checkbox (undefined)" onChange={onChangeUncontrolled} />
      <Checkbox label="Unchecked checkbox (uncontrolled)" onChange={onChangeUncontrolled} defaultChecked={false} />
      <Checkbox label="Checked checkbox (uncontrolled)" onChange={onChangeUncontrolled} defaultChecked accessibilityLabel="Hello there" />
      <Checkbox label="Disabled checkbox" disabled />
      <Checkbox label="Disabled checked checkbox" defaultChecked disabled />
    </View>
  );
};

const BasicCheckbox: React.FunctionComponent = () => {
  return (
    <View>
      <Checkbox label="Unchecked checkbox (undefined)" onChange={onChangeUncontrolled} />
      <Checkbox label="Unchecked checkbox (uncontrolled)" onChange={onChangeUncontrolled} defaultChecked={false} />
      <Checkbox label="Checked checkbox (uncontrolled)" onChange={onChangeUncontrolled} defaultChecked accessibilityLabel="Hello there" />
      <Checkbox label="Disabled checkbox" disabled />
      <Checkbox label="Disabled checked checkbox" defaultChecked disabled />
      <Checkbox label="Checkbox will display a tooltip" tooltip="This is a tooltip" />
      <Checkbox label="A circular checkbox" shape="circular" />
      <Checkbox label="A checkbox with label placed before" labelPosition="before" />
      <Checkbox label="A required checkbox" required />
    </View>
  );
};

const SizeCheckbox: React.FunctionComponent = () => {
  return (
    <View>
      <Checkbox tooltip="Medium checkbox" size="medium" />
      <Checkbox tooltip="Large checkbox" size="large" />
      <Checkbox label="Medium checkbox" size="medium" />
      <Checkbox label="Large checkbox" size="large" />
    </View>
  );
};

const OtherCheckbox: React.FunctionComponent = () => {
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
        label="Checkbox rendered with labelPosition 'before' (controlled)"
        onChange={onChangeControlled2}
        labelPosition="before"
        checked={Boolean(isCheckedControlled2)}
      />
      <Checkbox label="A required checkbox with other required text" required="**" />
    </View>
  );
};

const CircleColorCheckbox = Checkbox.customize({
  checked: {
    checkboxBackgroundColor: 'green',
    checkboxBorderColor: 'green',
    checkmarkColor: 'white',
  },
});

const HoverCheckbox = Checkbox.customize({
  hovered: {
    checkmarkOpacity: 1,
  },
});

const BigLabelCheckbox = Checkbox.customize({
  label: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

const ComposedCheckbox = Checkbox.compose({
  slotProps: {
    label: { style: { color: 'hotpink' } },
  },
});

const getThemedStyles = themedStyleSheet((t: Theme) => {
  return { textbox: { ...commonStyles.textBox, borderColor: t.colors.inputBorder } };
});

const TokenCheckbox: React.FunctionComponent = () => {
  const [checkboxColor, setCheckboxColor] = React.useState('blue');
  const [checkmarkColor, setCheckmarkColor] = React.useState('white');

  const BlueCheckbox = Checkbox.customize({
    checked: {
      checkboxBackgroundColor: checkboxColor,
      checkboxBorderColor: checkboxColor,
      checkmarkColor: checkmarkColor,
    },
  });

  const theme = useTheme();
  const textBoxBorderStyle = getThemedStyles(theme);

  return (
    <View>
      <HoverCheckbox label="A checkbox with checkmark visible on hover" onChange={onChangeUncontrolled} />
      <CircleColorCheckbox label="A circular token-customized checkbox" shape="circular" onChange={onChangeUncontrolled} defaultChecked />
      <BigLabelCheckbox label="A checkbox with a bold large font label" />
      <ComposedCheckbox label="A checkbox with a hot pink label and no padding" />

      <BlueCheckbox
        label="Token-customized checkbox. Customizable below."
        onChange={onChangeUncontrolled}
        labelPosition="before"
        defaultChecked={false}
      />
      <TextInput
        accessibilityLabel="Background color"
        style={textBoxBorderStyle.textbox}
        placeholder="Background color"
        blurOnSubmit={true}
        onSubmitEditing={(e) => {
          setCheckboxColor(e.nativeEvent.text);
        }}
      />

      <TextInput
        accessibilityLabel="Checkmark color"
        style={textBoxBorderStyle.textbox}
        placeholder="Checkmark color"
        blurOnSubmit={true}
        onSubmitEditing={(e) => {
          setCheckmarkColor(e.nativeEvent.text);
        }}
      />
    </View>
  );
};

const UnSupportedOnAndroid = () => {
  return (
    <Text style={{ margin: 10, fontSize: 14 }} color="red">
      Unsupported on Android
    </Text>
  );
};

const checkboxSections: TestSection[] = [
  {
    name: 'Basic Checkboxes',
    testID: EXPERIMENTAL_CHECKBOX_TESTPAGE,
    component: Platform.OS === 'android' ? AndroidBasicCheckbox : BasicCheckbox,
  },
  {
    name: 'Size Checkboxes',
    component: Platform.OS === 'android' ? UnSupportedOnAndroid : SizeCheckbox,
  },
  {
    name: 'Other Implementations',
    component: OtherCheckbox,
  },
  {
    name: 'Token Customized Checkboxes',
    component: TokenCheckbox,
  },
  {
    name: 'E2E Testing for Experimental Checkbox',
    component: E2ECheckboxExperimentalTest,
  },
];

export const ExperimentalCheckboxTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'N/A',
    iosStatus: 'N/A',
    macosStatus: 'Experimental',
    androidStatus: 'Experimental',
  };

  const description =
    'Checkboxes give people a way to select one or more items from a group, or switch between two mutually exclusive options (checked or unchecked, on or off).';

  return <Test name="Experimental Checkbox Test" description={description} sections={checkboxSections} status={status} />;
};
