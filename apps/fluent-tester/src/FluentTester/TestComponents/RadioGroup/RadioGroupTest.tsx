import * as React from 'react';
import { View } from 'react-native';
import { RadioButton, RadioGroup, Separator, Button } from '@fluentui/react-native';
import { RADIOGROUP_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const basicRadioGroup: React.FunctionComponent<{}> = () => {
  // Client's example onChange function
  const onChange = (key: string) => {
    console.log(key);
  };

  const [selectedKey, setSelectedKey] = React.useState('B');
  const onChange2 = React.useCallback(
    (key: string) => {
      if (key == 'A') {
        setSelectedKey('B');
      }
      else {
        setSelectedKey('D');
      }
    },
    []
  );

  return (
    <View>
      <RadioGroup label="This is a test RadioGroup" defaultSelectedKey="A" onChange={onChange}>
        <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
        <RadioButton content="Option B" buttonKey="B" />
        <RadioButton content="Option C" buttonKey="C" disabled={true} />
        <RadioButton content="Option D" buttonKey="D" />
      </RadioGroup>
      <Separator />
      <Button content="Separate" />
      <RadioGroup label="SelectedKey Set" selectedKey={selectedKey} onChange={onChange2}>
        <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
        <RadioButton content="Option B" buttonKey="B" />
        <RadioButton content="Option C" buttonKey="C" disabled={true} />
        <RadioButton content="Option D" buttonKey="D" />
      </RadioGroup>
      <Separator />
      <RadioGroup label="SelectedKey Set" selectedKey={selectedKey} defaultSelectedKey="C" onChange={onChange2}>
        <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
        <RadioButton content="Option B" buttonKey="B" />
        <RadioButton content="Option C" buttonKey="C" disabled={true} />
        <RadioButton content="Option D" buttonKey="D" />
      </RadioGroup>
    </View>

  );
};

const radioGroupSections: TestSection[] = [
  {
    name: 'Basic RadioGroup Usage',
    testID: RADIOGROUP_TESTPAGE,
    component: basicRadioGroup,
  },
];

export const RadioGroupTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = 'No description.';

  return <Test name="RadioGroup Test" description={description} sections={radioGroupSections} status={status}></Test>;
};
