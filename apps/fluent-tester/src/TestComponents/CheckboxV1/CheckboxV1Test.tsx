import * as React from 'react';
import { CHECKBOXV1_TESTPAGE } from '../../../../E2E/src/CheckboxV1/consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Checkbox } from '@fluentui-react-native/experimental-checkbox';
import { Theme, useTheme } from '@fluentui-react-native/theme-types';
import { View, TextInput, Platform } from 'react-native';
import { commonTestStyles as commonStyles, mobileStyles } from '../Common/styles';
import { E2ECheckboxExperimentalTest } from './E2ECheckboxV1Test';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';
import { ButtonV1 as Button } from '@fluentui-react-native/button';

function onChangeUncontrolled(_e: InteractionEvent, isChecked: boolean) {
  console.log(isChecked);
}

const BasicCheckbox: React.FunctionComponent = () => {
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

const DesktopSpecificCheckbox: React.FunctionComponent = () => {
  return (
    <>
      <Checkbox label="Checkbox will display a tooltip" tooltip="This is a tooltip" />
      <Checkbox label="A circular checkbox" shape="circular" />
      <Checkbox label="A checkbox with label placed before" labelPosition="before" />
      <Checkbox label="A required checkbox" required />
    </>
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
  const [isChecked, setisChecked] = React.useState(false);

  const setCheckedTrue = React.useCallback(() => {
    setisChecked(true);
  }, []);

  const setCheckedFalse = React.useCallback(() => {
    setisChecked(false);
  }, []);

  const memoizedStyles = React.useMemo(() => (Platform.OS === 'android' ? { ...mobileStyles.containerSpacedEvenly, height: 150 } : {}), []);

  return (
    <View style={memoizedStyles}>
      <Button onClick={setCheckedTrue} size="small">
        Check controlled checkboxes below
      </Button>
      <Button onClick={setCheckedFalse} size="small">
        Uncheck controlled checkboxes below
      </Button>

      <Checkbox label="This is a controlled Checkbox" checked={isChecked} />
      {Platform.OS !== 'android' && (
        <>
          <Checkbox label="Checkbox rendered with labelPosition 'before' (controlled)" labelPosition="before" checked={isChecked} />
          <Checkbox label="A required checkbox with other required text" required="**" />
        </>
      )}
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
      {Platform.OS !== 'android' && (
        <>
          <HoverCheckbox label="A checkbox with checkmark visible on hover" onChange={onChangeUncontrolled} />
          <CircleColorCheckbox
            label="A circular token-customized checkbox"
            shape="circular"
            onChange={onChangeUncontrolled}
            defaultChecked
          />
        </>
      )}

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
    testID: CHECKBOXV1_TESTPAGE,
    component: BasicCheckbox,
  },
  Platform.select({
    android: null,
    default: {
      name: 'Size Checkboxes',
      component: SizeCheckbox,
    },
  }),
  Platform.select({
    android: null,
    default: {
      name: 'Desktop Specific Checkboxes',
      component: DesktopSpecificCheckbox,
    },
  }),
  {
    name: 'Other Implementations',
    component: OtherCheckbox,
  },
  Platform.select({
    android: null,
    default: {
      name: 'Token Customized Checkboxes',
      component: TokenCheckbox,
    },
  }),
  {
    name: 'E2E Testing for Experimental Checkbox',
    component: E2ECheckboxExperimentalTest,
  },
];

export const ExperimentalCheckboxTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'N/A',
    iosStatus: 'N/A',
    macosStatus: 'Experimental',
    androidStatus: 'Experimental',
  };

  const description =
    'Checkboxes give people a way to select one or more items from a group, or switch between two mutually exclusive options (checked or unchecked, on or off).';

  return <Test name="Experimental Checkbox Test" description={description} sections={checkboxSections} status={status} />;
};
