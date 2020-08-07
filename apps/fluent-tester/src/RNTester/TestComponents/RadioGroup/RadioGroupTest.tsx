import * as React from 'react';
import { RadioButton, RadioGroup } from '@fluentui-react-native/radio-group';
import { RADIOGROUP_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const basicRadioGroup: React.FunctionComponent<{}> = () => {
  // Client's example onChange function
  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <RadioGroup label="This is a test RadioGroup" defaultSelectedKey="A" onChange={onChange}>
      <RadioButton content="Option A" buttonKey="A" ariaLabel="Cool" />
      <RadioButton content="Option B" buttonKey="B" />
      <RadioButton content="Option C" buttonKey="C" disabled={true} />
      <RadioButton content="Option D" buttonKey="D" />
    </RadioGroup>
  );
}

const radioGroupSections: TestSection[] = [
  {
    name: 'Basic RadioGroup Usage',
    testID: RADIOGROUP_TESTPAGE,
    component: basicRadioGroup
  }
];

export const RadioGroupTest: React.FunctionComponent<{}> = () => {

  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog'
  }

  const description = 'No description.'

  return (
    <Test name="RadioGroup Test" description={description} sections={radioGroupSections} status={status}></Test>
  );
};