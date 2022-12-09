import * as React from 'react';
import { CHECKBOX_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Checkbox } from '@fluentui-react-native/experimental-checkbox';
import { Theme, useTheme } from '@fluentui-react-native/theme-types';
import { View, TextInput } from 'react-native';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { E2ECheckboxV1Test } from './E2ECheckboxExperimentalTest';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { BasicCheckbox_legacy, OtherCheckbox_legacy, TokenCheckbox_legacy } from './legacy/CheckboxTest';
import { E2ECheckboxTest_legacy } from './legacy/CheckboxE2ETest';
import { BasicCheckbox } from './BasicCheckbox';
import { SizeCheckbox } from './SizeCheckbox';

function onChangeUncontrolled(_e: InteractionEvent, isChecked: boolean) {
  console.log(isChecked);
}

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

const checkboxSections: TestSection[] = [
  {
    name: 'Basic Checkboxes',
    testID: CHECKBOX_TESTPAGE,
    component: BasicCheckbox,
  },
  {
    name: 'Size Checkboxes',
    component: SizeCheckbox,
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
    name: 'E2E Testing for CheckboxV1',
    component: E2ECheckboxV1Test,
  },
  {
    name: 'Legacy - Basic Checkboxes',
    testID: CHECKBOX_TESTPAGE,
    component: BasicCheckbox_legacy,
  },
  {
    name: 'Legacy - Other Implementations',
    component: OtherCheckbox_legacy,
  },
  {
    name: 'Legacy - Token Customized Checkboxes',
    component: TokenCheckbox_legacy,
  },
  {
    name: 'Legacy - Checkbox for E2E Testing',
    component: E2ECheckboxTest_legacy,
  },
];

export const CheckboxTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'N/A',
    macosStatus: 'Experimental',
    androidStatus: 'Experimental',
  };

  const description =
    'Checkboxes give people a way to select one or more items from a group, or switch between two mutually exclusive options (checked or unchecked, on or off).';

  return <Test name="Checkbox Test" description={description} sections={checkboxSections} status={status} />;
};
