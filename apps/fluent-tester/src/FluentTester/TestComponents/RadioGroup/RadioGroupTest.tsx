import * as React from 'react';
import { Platform, View } from 'react-native';
import { RadioButton, RadioGroup, Separator } from '@fluentui/react-native';
import { RADIOGROUP_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { NativeRadioButton } from '@fluentui-react-native/native-radio-button';

const basicRadioGroup: React.FunctionComponent = () => {
  // Client's example onChange function
  const onChange = (key: string) => {
    console.log(key);
  };

  const [selectedKey, setSelectedKey] = React.useState('C');

  const onChange2 = React.useCallback((key: string) => {
    if (key == 'A') {
      setSelectedKey('A');
    } else if (key == 'B') {
      setSelectedKey('B');
    } else if (key == 'C') {
      setSelectedKey('C');
    } else if (key == 'D') {
      setSelectedKey('D');
    }
  }, []);

  return (
    <View>
      <RadioGroup label="Uncontrolled RadioGroup" defaultSelectedKey="B" onChange={onChange}>
        <RadioButton content="Option A" buttonKey="A" ariaLabel="Test Aria Label" />
        <RadioButton content="Option B" buttonKey="B" />
        <RadioButton content="Option C (disabled)" buttonKey="C" disabled={true} />
        <RadioButton content="Option D" buttonKey="D" />
      </RadioGroup>
      <Separator />
      <RadioGroup label="Controlled RadioGroup" selectedKey={selectedKey} onChange={onChange2}>
        <View>
          <RadioButton content="Option A" buttonKey="A" ariaLabel="Test Aria Label" ariaPosInSet={1} ariaSetSize={4} />
          <RadioButton content="Option B" buttonKey="B" ariaPosInSet={2} ariaSetSize={4} />
          <RadioButton content="Option C" buttonKey="C" ariaPosInSet={3} ariaSetSize={4} />
          <RadioButton content="Option D" buttonKey="D" ariaPosInSet={4} ariaSetSize={4} />
        </View>
      </RadioGroup>
    </View>
  );
};

const nativeRadioGroup: React.FunctionComponent = () => {
  return (
    <View>
      <RadioGroup label="RadioGroup 1">
        <NativeRadioButton title="Option A" selected={true} onPress={() => alert('Option A pressed')} buttonKey="A" />
        <NativeRadioButton title="Option B" buttonKey="B" />
        <NativeRadioButton title="Option C (disabled)" enabled={false} style={{ width: 150 }} buttonKey="C" />
        <NativeRadioButton title="Option D" buttonKey="D" />
      </RadioGroup>
      <Separator />
      <RadioGroup label="RadioGroup 2">
        {/* View added to test ariaPosInSet and ariaSetSize properties which are not auto-generated when
        RadioButtons are not direct children of RadioGroup. */}
        <NativeRadioButton title="Option A" buttonKey="A" />
        <NativeRadioButton title="Option B" selected={true} onPress={() => alert('Option B pressed')} buttonKey="B" />
        <NativeRadioButton title="Option C (disabled)" enabled={false} style={{ width: 150 }} buttonKey="C" />
        <NativeRadioButton title="Option D" buttonKey="D" />
      </RadioGroup>
    </View>
  );
};

const radioGroupSections: TestSection[] = [];
if (Platform.OS === 'macos') {
  radioGroupSections.push({
    name: 'Native RadioGroup',
    testID: RADIOGROUP_TESTPAGE,
    component: nativeRadioGroup,
  });
} else {
  radioGroupSections.push({
    name: 'Basic RadioGroup Usage',
    testID: RADIOGROUP_TESTPAGE,
    component: basicRadioGroup,
  });
}

export const RadioGroupTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Backlog',
  };

  const description = 'No description.';

  return <Test name="RadioGroup Test" description={description} sections={radioGroupSections} status={status} />;
};
