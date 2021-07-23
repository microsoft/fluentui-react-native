import * as React from 'react';
import { Platform, View } from 'react-native';
import { RadioButton, RadioGroup, Separator } from '@fluentui/react-native';
import { RADIOGROUP_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { NativeRadioButton } from '@fluentui-react-native/native-radio-button';

const basicRadioGroup: React.FunctionComponent<{}> = () => {
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
        <RadioButton content="Option A" buttonKey="A" ariaLabel="Test Aria Label" />
        <RadioButton content="Option B" buttonKey="B" />
        <RadioButton content="Option C" buttonKey="C" />
        <RadioButton content="Option D" buttonKey="D" />
      </RadioGroup>
    </View>
  );
};

const nativeRadioGroup: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <RadioGroup label="RadioGroup 1">
        <NativeRadioButton title="Option A" onChange={() => alert('Option A pressed')} />
        <NativeRadioButton title="Option B" buttonKey="B" state={true} />
        <NativeRadioButton title="Option C (disabled)" enabled={false} style={{ width: 150 }} />
        <NativeRadioButton title="Option D" />
      </RadioGroup>
      <Separator />
      <RadioGroup label="RadioGroup 2">
        <NativeRadioButton title="Option A" onChange={() => alert('Option A pressed')} />
        <NativeRadioButton title="Option B" state={true} onChange={() => alert('Option B pressed')} />
        <NativeRadioButton title="Option C (disabled)" enabled={false} style={{ width: 150 }} />
        <NativeRadioButton title="Option D" />
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

export const RadioGroupTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Backlog',
  };

  const description = 'No description.';

  return <Test name="RadioGroup Test" description={description} sections={radioGroupSections} status={status}></Test>;
};
